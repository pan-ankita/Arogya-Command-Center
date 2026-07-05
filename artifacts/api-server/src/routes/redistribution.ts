import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, redistribRecommendationsTable, facilitiesTable, stockRecordsTable, medicinesTable, calamityAlertsTable, alertsTable } from "@workspace/db";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get("/redistribution", async (req, res): Promise<void> => {
  const recs = await db
    .select()
    .from(redistribRecommendationsTable)
    .orderBy(redistribRecommendationsTable.generatedAt);

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f]));
  const medicines = await db.select().from(medicinesTable);
  const medMap = new Map(medicines.map((m) => [m.id, m.name]));

  res.json(recs.reverse().map((r) => ({
    id: r.id,
    resourceType: r.resourceType,
    medicineId: r.medicineId ?? null,
    medicineName: r.medicineId ? (medMap.get(r.medicineId) ?? null) : null,
    sourceFacilityId: r.sourceFacilityId,
    sourceFacilityName: facMap.get(r.sourceFacilityId)?.name ?? "",
    targetFacilityId: r.targetFacilityId,
    targetFacilityName: facMap.get(r.targetFacilityId)?.name ?? "",
    suggestedQuantity: r.suggestedQuantity,
    distanceKm: r.distanceKm ?? null,
    reasoningText: r.reasoningText ?? null,
    priority: r.priority,
    status: r.status,
    generatedAt: r.generatedAt.toISOString(),
  })));
});

router.post("/redistribution/generate", async (req, res): Promise<void> => {
  const facilities = await db.select().from(facilitiesTable);
  const stocks = await db
    .select({
      facilityId: stockRecordsTable.facilityId,
      medicineId: stockRecordsTable.medicineId,
      currentQty: stockRecordsTable.currentQuantity,
      avgConsumption: stockRecordsTable.avgDailyConsumption,
    })
    .from(stockRecordsTable);

  const medicines = await db.select().from(medicinesTable);
  const activeCalamities = await db
    .select()
    .from(calamityAlertsTable)
    .where(eq(calamityAlertsTable.isActive, true));
  const calamityFacIds = new Set(activeCalamities.map((c) => c.facilityId));

  const facMap = new Map(facilities.map((f) => [f.id, f]));
  const newRecs: Array<typeof redistribRecommendationsTable.$inferInsert> = [];

  for (const med of medicines) {
    const medStocks = stocks.filter((s) => s.medicineId === med.id);
    const deficits = medStocks.filter((s) => {
      const days = s.avgConsumption > 0 ? s.currentQty / s.avgConsumption : 99;
      return days < med.reorderThresholdDays;
    });
    const surpluses = medStocks.filter((s) => {
      const days = s.avgConsumption > 0 ? s.currentQty / s.avgConsumption : 99;
      return days > med.reorderThresholdDays * 2.5;
    });

    for (const deficit of deficits) {
      for (const surplus of surpluses) {
        if (deficit.facilityId === surplus.facilityId) continue;
        const srcFac = facMap.get(surplus.facilityId);
        const tgtFac = facMap.get(deficit.facilityId);
        if (!srcFac || !tgtFac) continue;

        const dist = haversineKm(srcFac.latitude, srcFac.longitude, tgtFac.latitude, tgtFac.longitude);
        const targetDays = med.reorderThresholdDays * 1.5;
        const needed = Math.ceil(targetDays * (deficit.avgConsumption || 1) - deficit.currentQty);
        const available = surplus.currentQty - med.reorderThresholdDays * (surplus.avgConsumption || 1);
        const qty = Math.min(needed, Math.floor(available * 0.5));
        if (qty <= 0) continue;

        const isCalamity = calamityFacIds.has(deficit.facilityId);
        const priority = isCalamity ? "critical" : (deficit.currentQty <= 0 ? "high" : "normal");

        newRecs.push({
          resourceType: "medicine",
          medicineId: med.id,
          sourceFacilityId: surplus.facilityId,
          targetFacilityId: deficit.facilityId,
          suggestedQuantity: qty,
          distanceKm: Math.round(dist * 10) / 10,
          reasoningText: null,
          priority,
          status: "pending",
        });
      }
    }
  }

  if (newRecs.length === 0) {
    res.json([]);
    return;
  }

  const topRecs = newRecs.slice(0, 8);
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      for (const rec of topRecs) {
        const srcName = facMap.get(rec.sourceFacilityId!)?.name ?? "Source";
        const tgtName = facMap.get(rec.targetFacilityId!)?.name ?? "Target";
        const medName = medicines.find((m) => m.id === rec.medicineId)?.name ?? "medicine";
        const prompt = `You are a district health resource advisor. Write a 1-2 sentence plain-language justification for transferring ${rec.suggestedQuantity} units of ${medName} from ${srcName} to ${tgtName} (${rec.distanceKm} km apart). ${tgtName} is critically low on stock. Be concise and actionable.`;
        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { maxOutputTokens: 150 },
        });
        rec.reasoningText = result.text ?? null;
      }
    } catch {
      // continue without AI reasoning
    }
  }

  const inserted = await db.insert(redistribRecommendationsTable).values(topRecs).returning();

  const facilityRecs = await db.select().from(facilitiesTable);
  const facMap2 = new Map(facilityRecs.map((f) => [f.id, f.name]));
  const medMap = new Map(medicines.map((m) => [m.id, m.name]));

  res.json(inserted.map((r) => ({
    id: r.id,
    resourceType: r.resourceType,
    medicineId: r.medicineId ?? null,
    medicineName: r.medicineId ? (medMap.get(r.medicineId) ?? null) : null,
    sourceFacilityId: r.sourceFacilityId,
    sourceFacilityName: facMap2.get(r.sourceFacilityId) ?? "",
    targetFacilityId: r.targetFacilityId,
    targetFacilityName: facMap2.get(r.targetFacilityId) ?? "",
    suggestedQuantity: r.suggestedQuantity,
    distanceKm: r.distanceKm ?? null,
    reasoningText: r.reasoningText ?? null,
    priority: r.priority,
    status: r.status,
    generatedAt: r.generatedAt.toISOString(),
  })));
});

router.post("/redistribution/:id/accept", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [rec] = await db
    .update(redistribRecommendationsTable)
    .set({ status: "accepted" })
    .where(eq(redistribRecommendationsTable.id, id))
    .returning();

  if (!rec) { res.status(404).json({ error: "Not found" }); return; }

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f.name]));
  const medicines = await db.select().from(medicinesTable);
  const medMap = new Map(medicines.map((m) => [m.id, m.name]));

  res.json({
    id: rec.id, resourceType: rec.resourceType,
    medicineId: rec.medicineId ?? null, medicineName: rec.medicineId ? (medMap.get(rec.medicineId) ?? null) : null,
    sourceFacilityId: rec.sourceFacilityId, sourceFacilityName: facMap.get(rec.sourceFacilityId) ?? "",
    targetFacilityId: rec.targetFacilityId, targetFacilityName: facMap.get(rec.targetFacilityId) ?? "",
    suggestedQuantity: rec.suggestedQuantity, distanceKm: rec.distanceKm ?? null,
    reasoningText: rec.reasoningText ?? null, priority: rec.priority, status: rec.status,
    generatedAt: rec.generatedAt.toISOString(),
  });
});

router.post("/redistribution/:id/reject", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [rec] = await db
    .update(redistribRecommendationsTable)
    .set({ status: "rejected" })
    .where(eq(redistribRecommendationsTable.id, id))
    .returning();

  if (!rec) { res.status(404).json({ error: "Not found" }); return; }

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f.name]));
  const medicines = await db.select().from(medicinesTable);
  const medMap = new Map(medicines.map((m) => [m.id, m.name]));

  res.json({
    id: rec.id, resourceType: rec.resourceType,
    medicineId: rec.medicineId ?? null, medicineName: rec.medicineId ? (medMap.get(rec.medicineId) ?? null) : null,
    sourceFacilityId: rec.sourceFacilityId, sourceFacilityName: facMap.get(rec.sourceFacilityId) ?? "",
    targetFacilityId: rec.targetFacilityId, targetFacilityName: facMap.get(rec.targetFacilityId) ?? "",
    suggestedQuantity: rec.suggestedQuantity, distanceKm: rec.distanceKm ?? null,
    reasoningText: rec.reasoningText ?? null, priority: rec.priority, status: rec.status,
    generatedAt: rec.generatedAt.toISOString(),
  });
});

export default router;
