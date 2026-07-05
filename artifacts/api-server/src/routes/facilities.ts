import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, facilitiesTable, stockRecordsTable, bedsTable, doctorAttendanceTable, testAvailabilityTable, patientFootfallTable, calamityAlertsTable, medicinesTable, performanceFlagsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/facilities", async (req, res): Promise<void> => {
  const facilities = await db.select().from(facilitiesTable).orderBy(facilitiesTable.name);

  const activeCalamities = await db
    .select()
    .from(calamityAlertsTable)
    .where(eq(calamityAlertsTable.isActive, true));

  const calamityFacilityIds = new Set(activeCalamities.map((c) => c.facilityId));

  const latestFlags = await db.select().from(performanceFlagsTable).orderBy(performanceFlagsTable.flaggedAt);
  const flagMap = new Map<number, string>();
  for (const f of latestFlags) {
    flagMap.set(f.facilityId, f.status);
  }

  const result = facilities.map((f) => ({
    id: f.id,
    districtId: f.districtId,
    name: f.name,
    type: f.type,
    address: f.address,
    latitude: f.latitude,
    longitude: f.longitude,
    phone: f.phone,
    inchargeName: f.inchargeName,
    totalBedCapacity: f.totalBedCapacity,
    healthStatus: flagMap.get(f.id) ?? null,
    hasActiveCalamity: calamityFacilityIds.has(f.id),
    createdAt: f.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/facilities/district-summary", async (req, res): Promise<void> => {
  const facilities = await db.select().from(facilitiesTable);
  const flags = await db.select().from(performanceFlagsTable).orderBy(performanceFlagsTable.flaggedAt);

  const flagMap = new Map<number, string>();
  for (const f of flags) {
    flagMap.set(f.facilityId, f.status);
  }

  let redCount = 0, amberCount = 0, greenCount = 0;
  for (const f of facilities) {
    const status = flagMap.get(f.id) ?? "healthy";
    if (status === "critical") redCount++;
    else if (status === "watch") amberCount++;
    else greenCount++;
  }

  const activeCalamities = await db
    .select()
    .from(calamityAlertsTable)
    .where(eq(calamityAlertsTable.isActive, true));

  const { redistribRecommendationsTable, alertsTable } = await import("@workspace/db");
  const { eq: eq2 } = await import("drizzle-orm");

  const pendingRedist = await db
    .select()
    .from(redistribRecommendationsTable)
    .where(eq2(redistribRecommendationsTable.status, "pending"));

  const unreadAlerts = await db
    .select()
    .from(alertsTable)
    .where(eq2(alertsTable.isRead, false));

  const allBeds = await db.select().from(bedsTable);
  let totalBedsAvailable = 0, totalBedsOccupied = 0;
  for (const b of allBeds) {
    totalBedsOccupied += b.occupiedBeds;
    totalBedsAvailable += b.totalBeds - b.occupiedBeds;
  }

  const today = new Date().toISOString().split("T")[0];
  const todayFootfall = await db
    .select()
    .from(patientFootfallTable)
    .where(eq(patientFootfallTable.logDate, today));
  const totalFootfall = todayFootfall.reduce((sum, r) => sum + r.count, 0);

  res.json({
    totalFacilities: facilities.length,
    redCount,
    amberCount,
    greenCount,
    activeCalamities: activeCalamities.length,
    pendingRedistributions: pendingRedist.length,
    unreadAlerts: unreadAlerts.length,
    totalBedsAvailable,
    totalBedsOccupied,
    todayFootfall: totalFootfall,
  });
});

router.get("/facilities/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid facility id" });
    return;
  }

  const [facility] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, id));
  if (!facility) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }

  const [calamity] = await db
    .select()
    .from(calamityAlertsTable)
    .where(and(eq(calamityAlertsTable.facilityId, id), eq(calamityAlertsTable.isActive, true)));

  const [flag] = await db
    .select()
    .from(performanceFlagsTable)
    .where(eq(performanceFlagsTable.facilityId, id))
    .orderBy(performanceFlagsTable.flaggedAt);

  res.json({
    id: facility.id,
    districtId: facility.districtId,
    name: facility.name,
    type: facility.type,
    address: facility.address,
    latitude: facility.latitude,
    longitude: facility.longitude,
    phone: facility.phone,
    inchargeName: facility.inchargeName,
    totalBedCapacity: facility.totalBedCapacity,
    healthStatus: flag?.status ?? null,
    hasActiveCalamity: !!calamity,
    createdAt: facility.createdAt.toISOString(),
  });
});

router.get("/facilities/:id/health-score", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid facility id" });
    return;
  }

  const stocks = await db
    .select({ qty: stockRecordsTable.currentQuantity, avg: stockRecordsTable.avgDailyConsumption, medicineId: stockRecordsTable.medicineId })
    .from(stockRecordsTable)
    .where(eq(stockRecordsTable.facilityId, id));

  let stockScore = 100;
  if (stocks.length > 0) {
    const criticalCount = stocks.filter((s) => {
      const days = s.avg > 0 ? s.qty / s.avg : 99;
      return days < 3;
    }).length;
    const lowCount = stocks.filter((s) => {
      const days = s.avg > 0 ? s.qty / s.avg : 99;
      return days >= 3 && days < 7;
    }).length;
    stockScore = Math.max(0, 100 - (criticalCount * 20) - (lowCount * 8));
  }

  const beds = await db.select().from(bedsTable).where(eq(bedsTable.facilityId, id));
  let bedScore = 100;
  if (beds.length > 0) {
    const totalBeds = beds.reduce((s, b) => s + b.totalBeds, 0);
    const occupied = beds.reduce((s, b) => s + b.occupiedBeds, 0);
    const occupancy = totalBeds > 0 ? occupied / totalBeds : 0;
    bedScore = occupancy > 0.9 ? 20 : occupancy > 0.75 ? 60 : occupancy > 0.5 ? 80 : 100;
  }

  const today = new Date().toISOString().split("T")[0];
  const attendance = await db
    .select()
    .from(doctorAttendanceTable)
    .where(and(eq(doctorAttendanceTable.facilityId, id), eq(doctorAttendanceTable.attendanceDate, today)));
  let attendanceScore = 80;
  if (attendance.length > 0) {
    const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
    attendanceScore = Math.round((present / attendance.length) * 100);
  }

  const tests = await db.select().from(testAvailabilityTable).where(eq(testAvailabilityTable.facilityId, id));
  let testScore = 100;
  if (tests.length > 0) {
    const unavailable = tests.filter((t) => t.status !== "available").length;
    testScore = Math.max(0, 100 - (unavailable / tests.length) * 100);
  }

  const composite = Math.round(
    stockScore * 0.30 +
    bedScore * 0.20 +
    attendanceScore * 0.25 +
    testScore * 0.15 +
    80 * 0.10
  );

  const status = composite >= 70 ? "healthy" : composite >= 45 ? "watch" : "critical";

  const { performanceFlagsTable: pft } = await import("@workspace/db");
  await db.insert(pft).values({
    facilityId: id,
    compositeScore: composite,
    status,
    reasonBreakdown: { stockReliability: stockScore, bedStress: bedScore, doctorAttendance: attendanceScore, testReadiness: testScore },
  });

  res.json({
    facilityId: id,
    score: composite,
    status,
    breakdown: {
      stockReliability: stockScore,
      bedStress: bedScore,
      doctorAttendance: attendanceScore,
      testReadiness: testScore,
      footfallOverload: 80,
    },
  });
});

router.get("/performance-flags", async (req, res): Promise<void> => {
  const flags = await db
    .select()
    .from(performanceFlagsTable)
    .orderBy(performanceFlagsTable.flaggedAt);

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f.name]));

  const latestPerFacility = new Map<number, typeof flags[0]>();
  for (const f of flags) {
    latestPerFacility.set(f.facilityId, f);
  }

  const result = Array.from(latestPerFacility.values()).map((f) => ({
    id: f.id,
    facilityId: f.facilityId,
    facilityName: facMap.get(f.facilityId) ?? "Unknown",
    compositeScore: f.compositeScore,
    reasonBreakdown: f.reasonBreakdown,
    status: f.status,
    flaggedAt: f.flaggedAt.toISOString(),
  }));

  res.json(result);
});

export default router;
