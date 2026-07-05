import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { db, facilitiesTable, stockRecordsTable, medicinesTable, patientFootfallTable, bedsTable, doctorAttendanceTable, calamityAlertsTable, alertsTable } from "@workspace/db";

const router: IRouter = Router();

function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

router.get("/forecast/:facilityId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.facilityId) ? req.params.facilityId[0] : req.params.facilityId;
  const facilityId = parseInt(rawId, 10);
  if (isNaN(facilityId)) { res.status(400).json({ error: "Invalid facilityId" }); return; }

  const [facility] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, facilityId));
  if (!facility) { res.status(404).json({ error: "Facility not found" }); return; }

  const stocks = await db
    .select({
      medicineId: stockRecordsTable.medicineId,
      currentQty: stockRecordsTable.currentQuantity,
      avgConsumption: stockRecordsTable.avgDailyConsumption,
      medicineName: medicinesTable.name,
    })
    .from(stockRecordsTable)
    .leftJoin(medicinesTable, eq(stockRecordsTable.medicineId, medicinesTable.id))
    .where(eq(stockRecordsTable.facilityId, facilityId));

  const [activeCalamity] = await db
    .select()
    .from(calamityAlertsTable)
    .where(eq(calamityAlertsTable.facilityId, facilityId));

  const calamityMultiplier = activeCalamity?.isActive ? 1.5 : 1.0;
  const ai = getAI();

  const medicines = await Promise.all(
    stocks.map(async (s) => {
      const adjustedConsumption = s.avgConsumption * calamityMultiplier;
      const daysRemaining = adjustedConsumption > 0 ? s.currentQty / adjustedConsumption : null;

      const forecastData = [];
      let projectedQty = s.currentQty;
      for (let i = 1; i <= 7; i++) {
        projectedQty = Math.max(0, projectedQty - adjustedConsumption);
        const d = new Date();
        d.setDate(d.getDate() + i);
        forecastData.push({ date: d.toISOString().split("T")[0], projected: Math.round(projectedQty) });
      }

      let riskLevel: "ok" | "watch" | "critical" = "ok";
      if (daysRemaining !== null) {
        if (daysRemaining <= 3) riskLevel = "critical";
        else if (daysRemaining <= 7) riskLevel = "watch";
      }

      let aiInsight: string | null = null;
      if (ai && riskLevel !== "ok") {
        try {
          const prompt = `In 1 sentence, describe the stock risk for ${s.medicineName} at ${facility.name}. Current stock: ${Math.round(s.currentQty)} units. Daily consumption: ~${adjustedConsumption.toFixed(1)} units. Days remaining: ${daysRemaining !== null ? Math.floor(daysRemaining) : "unknown"}. ${activeCalamity?.isActive ? "Active calamity is boosting demand." : ""}`;
          const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { maxOutputTokens: 100 },
          });
          aiInsight = result.text ?? null;
        } catch {
          aiInsight = null;
        }
      }

      return {
        medicineId: s.medicineId,
        medicineName: s.medicineName ?? "",
        currentStock: s.currentQty,
        daysRemaining: daysRemaining !== null ? Math.floor(daysRemaining) : null,
        forecastData,
        aiInsight,
        riskLevel,
      };
    })
  );

  res.json({
    facilityId,
    facilityName: facility.name,
    medicines: medicines.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999)),
  });
});

router.post("/assistant/query", async (req, res): Promise<void> => {
  const { question } = req.body;
  if (!question) { res.status(400).json({ error: "question required" }); return; }

  const ai = getAI();
  if (!ai) {
    res.json({ answer: "AI assistant is not configured. Please provide a GEMINI_API_KEY.", sources: [] });
    return;
  }

  const facilities = await db.select().from(facilitiesTable);
  const stocks = await db
    .select({ facilityId: stockRecordsTable.facilityId, qty: stockRecordsTable.currentQuantity, avg: stockRecordsTable.avgDailyConsumption, medicineName: medicinesTable.name })
    .from(stockRecordsTable)
    .leftJoin(medicinesTable, eq(stockRecordsTable.medicineId, medicinesTable.id));

  const today = new Date().toISOString().split("T")[0];
  const attendance = await db
    .select()
    .from(doctorAttendanceTable)
    .where(eq(doctorAttendanceTable.attendanceDate, today));

  const beds = await db.select().from(bedsTable);
  const calamities = await db.select().from(calamityAlertsTable).where(eq(calamityAlertsTable.isActive, true));

  const context = `
DISTRICT: Hooghly, West Bengal
FACILITIES: ${facilities.map((f) => `${f.name} (${f.type})`).join(", ")}

STOCK STATUS (low stock = <7 days remaining):
${stocks
  .map((s) => {
    const days = s.avg > 0 ? Math.floor(s.qty / s.avg) : "N/A";
    const facName = facilities.find((f) => f.id === s.facilityId)?.name ?? "Unknown";
    return `  ${facName}: ${s.medicineName} — ${s.qty} units (~${days} days)`;
  })
  .join("\n")}

BED OCCUPANCY:
${beds
  .map((b) => {
    const facName = facilities.find((f) => f.id === b.facilityId)?.name ?? "Unknown";
    return `  ${facName} ${b.wardName}: ${b.occupiedBeds}/${b.totalBeds} occupied`;
  })
  .join("\n")}

DOCTOR ATTENDANCE TODAY:
${attendance
  .map((a) => {
    const facName = facilities.find((f) => f.id === a.facilityId)?.name ?? "Unknown";
    return `  Doctor #${a.doctorId} at ${facName}: ${a.status}`;
  })
  .join("\n")}

ACTIVE CALAMITIES: ${calamities.length === 0 ? "None" : calamities.map((c) => {
    const facName = facilities.find((f) => f.id === c.facilityId)?.name ?? "Unknown";
    return `${facName} — ${c.type} (${c.severity})`;
  }).join(", ")}
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are the ArogyaLive AI assistant for district health administration in Hooghly, West Bengal. Answer ONLY based on the live data provided below. Be concise and specific — name exact facilities and medicines. Do not mention data you don't have.

LIVE DATA:
${context}

QUESTION: ${question}`,
          }],
        },
      ],
      config: { maxOutputTokens: 512 },
    });

    res.json({
      answer: result.text ?? "I couldn't generate an answer. Please try again.",
      sources: facilities.map((f) => f.name),
    });
  } catch (err) {
    res.json({ answer: "AI query failed. Please check your API key and try again.", sources: [] });
  }
});

router.post("/voice/parse", async (req, res): Promise<void> => {
  const { transcript, facilityId, language } = req.body;
  if (!transcript || !facilityId) {
    res.status(400).json({ error: "transcript and facilityId required" });
    return;
  }

  const ai = getAI();
  if (!ai) {
    res.json({
      action: "unknown",
      medicineName: null, medicineId: null, quantity: null,
      department: null, count: null, confidence: 0,
      rawTranscript: transcript,
    });
    return;
  }

  const medicines = await db.select().from(medicinesTable);
  const medList = medicines.map((m) => m.name).join(", ");

  try {
    const prompt = `Parse this voice command for a health center data entry system. Return ONLY a JSON object.

Voice command: "${transcript}"

Available medicines: ${medList}
Available departments: OPD, Emergency, ANC, Pediatric, General

Return JSON with these fields:
- action: one of "add_stock", "log_consumption", "log_footfall", "update_beds", "mark_attendance", "unknown"
- medicineName: medicine name if relevant, else null
- medicineId: null (system will resolve)
- quantity: numeric quantity if relevant, else null
- department: department name if relevant, else null
- count: patient count if relevant, else null
- confidence: 0-1 float

Example: {"action":"add_stock","medicineName":"Paracetamol","medicineId":null,"quantity":50,"department":null,"count":null,"confidence":0.95}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", maxOutputTokens: 256 },
    });

    const parsed = JSON.parse(result.text ?? "{}");

    if (parsed.medicineName) {
      const matchedMed = medicines.find(
        (m) => m.name.toLowerCase() === parsed.medicineName?.toLowerCase()
      );
      if (matchedMed) parsed.medicineId = matchedMed.id;
    }

    res.json({ ...parsed, rawTranscript: transcript });
  } catch {
    res.json({
      action: "unknown",
      medicineName: null, medicineId: null, quantity: null,
      department: null, count: null, confidence: 0,
      rawTranscript: transcript,
    });
  }
});

export default router;
