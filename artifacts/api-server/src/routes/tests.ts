import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, testAvailabilityTable, testsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/tests", async (req, res): Promise<void> => {
  const facilityId = parseInt(req.query.facilityId as string, 10);
  if (isNaN(facilityId)) {
    res.status(400).json({ error: "facilityId required" });
    return;
  }

  const records = await db
    .select({
      id: testAvailabilityTable.id,
      facilityId: testAvailabilityTable.facilityId,
      testId: testAvailabilityTable.testId,
      status: testAvailabilityTable.status,
      lastCheckedAt: testAvailabilityTable.lastCheckedAt,
      testName: testsTable.name,
      category: testsTable.category,
    })
    .from(testAvailabilityTable)
    .leftJoin(testsTable, eq(testAvailabilityTable.testId, testsTable.id))
    .where(eq(testAvailabilityTable.facilityId, facilityId))
    .orderBy(testsTable.name);

  res.json(records.map((r) => ({
    id: r.id,
    facilityId: r.facilityId,
    testId: r.testId,
    testName: r.testName ?? "",
    category: r.category ?? "",
    status: r.status,
    lastCheckedAt: r.lastCheckedAt?.toISOString() ?? null,
  })));
});

router.patch("/tests/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { status } = req.body;

  if (isNaN(id) || !status) {
    res.status(400).json({ error: "id and status required" });
    return;
  }

  const [record] = await db
    .update(testAvailabilityTable)
    .set({ status, lastCheckedAt: new Date() })
    .where(eq(testAvailabilityTable.id, id))
    .returning();

  if (!record) {
    res.status(404).json({ error: "Test availability not found" });
    return;
  }

  const [test] = await db.select().from(testsTable).where(eq(testsTable.id, record.testId));

  res.json({
    id: record.id,
    facilityId: record.facilityId,
    testId: record.testId,
    testName: test?.name ?? "",
    category: test?.category ?? "",
    status: record.status,
    lastCheckedAt: record.lastCheckedAt?.toISOString() ?? null,
  });
});

export default router;
