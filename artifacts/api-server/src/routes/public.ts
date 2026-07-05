import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, facilitiesTable, bedsTable, testAvailabilityTable, testsTable, calamityAlertsTable, performanceFlagsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/public/facilities", async (req, res): Promise<void> => {
  const facilities = await db
    .select()
    .from(facilitiesTable)
    .orderBy(facilitiesTable.name);

  const beds = await db.select().from(bedsTable);
  const tests = await db
    .select({
      facilityId: testAvailabilityTable.facilityId,
      testId: testAvailabilityTable.testId,
      status: testAvailabilityTable.status,
      testName: testsTable.name,
      category: testsTable.category,
    })
    .from(testAvailabilityTable)
    .leftJoin(testsTable, eq(testAvailabilityTable.testId, testsTable.id));

  const calamities = await db
    .select()
    .from(calamityAlertsTable)
    .where(eq(calamityAlertsTable.isActive, true));
  const calamityFacIds = new Set(calamities.map((c) => c.facilityId));

  const flags = await db.select().from(performanceFlagsTable).orderBy(performanceFlagsTable.flaggedAt);
  const flagMap = new Map<number, string>();
  for (const f of flags) {
    flagMap.set(f.facilityId, f.status);
  }

  const result = facilities.map((f) => {
    const facBeds = beds.filter((b) => b.facilityId === f.id);
    const totalBeds = facBeds.reduce((sum, b) => sum + b.totalBeds, 0);
    const availBeds = facBeds.reduce((sum, b) => sum + (b.totalBeds - b.occupiedBeds), 0);

    const facTests = tests.filter((t) => t.facilityId === f.id && t.status === "available");

    return {
      id: f.id,
      name: f.name,
      type: f.type,
      address: f.address,
      latitude: f.latitude,
      longitude: f.longitude,
      phone: f.phone,
      inchargeName: f.inchargeName,
      totalBeds,
      availableBeds: availBeds,
      availableTests: facTests.map((t) => ({
        name: t.testName ?? "",
        category: t.category ?? "",
      })),
      hasActiveCalamity: calamityFacIds.has(f.id),
      overallStatus: flagMap.get(f.id) ?? "healthy",
    };
  });

  res.json(result);
});

router.get("/public/district-status", async (req, res): Promise<void> => {
  const facilities = await db.select().from(facilitiesTable);
  const calamities = await db
    .select()
    .from(calamityAlertsTable)
    .where(eq(calamityAlertsTable.isActive, true));

  const flags = await db.select().from(performanceFlagsTable).orderBy(performanceFlagsTable.flaggedAt);
  const flagMap = new Map<number, string>();
  for (const f of flags) {
    flagMap.set(f.facilityId, f.status);
  }

  let redCount = 0, amberCount = 0, greenCount = 0;
  for (const f of facilities) {
    const s = flagMap.get(f.id) ?? "healthy";
    if (s === "critical") redCount++;
    else if (s === "watch") amberCount++;
    else greenCount++;
  }

  const beds = await db.select().from(bedsTable);
  const totalBeds = beds.reduce((s, b) => s + b.totalBeds, 0);
  const availBeds = beds.reduce((s, b) => s + (b.totalBeds - b.occupiedBeds), 0);

  res.json({
    totalFacilities: facilities.length,
    redCount,
    amberCount,
    greenCount,
    activeCalamities: calamities.map((c) => ({
      id: c.id,
      type: c.type,
      severity: c.severity,
      description: c.description ?? null,
      facilityId: c.facilityId,
      facilityName: facilities.find((f) => f.id === c.facilityId)?.name ?? null,
      triggeredAt: c.triggeredAt.toISOString(),
    })),
    bedSummary: { total: totalBeds, available: availBeds },
    lastUpdated: new Date().toISOString(),
  });
});

export default router;
