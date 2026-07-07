import { Router, type IRouter } from "express";
import { eq, and, gte } from "drizzle-orm";
import { db, patientFootfallTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { getIO } from "../lib/socket";

const router: IRouter = Router();

router.get("/footfall", async (req, res): Promise<void> => {
  const facilityId = parseInt(req.query.facilityId as string, 10);
  if (isNaN(facilityId)) {
    res.status(400).json({ error: "facilityId required" });
    return;
  }
  const days = parseInt(req.query.days as string, 10) || 14;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const records = await db
    .select()
    .from(patientFootfallTable)
    .where(and(
      eq(patientFootfallTable.facilityId, facilityId),
      gte(patientFootfallTable.logDate, cutoffStr)
    ))
    .orderBy(patientFootfallTable.logDate);

  res.json(records.map((r) => ({
    id: r.id,
    facilityId: r.facilityId,
    department: r.department,
    count: r.count,
    logDate: r.logDate,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/footfall/log", async (req, res): Promise<void> => {
  const { facilityId, department, count, logDate } = req.body;
  if (!facilityId || !department || count == null) {
    res.status(400).json({ error: "facilityId, department, count required" });
    return;
  }

  const date = logDate ?? new Date().toISOString().split("T")[0];

  const [existing] = await db
    .select()
    .from(patientFootfallTable)
    .where(and(
      eq(patientFootfallTable.facilityId, facilityId),
      eq(patientFootfallTable.department, department),
      eq(patientFootfallTable.logDate, date)
    ));

  let record;
  if (existing) {
    const [updated] = await db
      .update(patientFootfallTable)
      .set({ count })
      .where(eq(patientFootfallTable.id, existing.id))
      .returning();
    record = updated;
  } else {
    const [created] = await db
      .insert(patientFootfallTable)
      .values({ facilityId, department, count, logDate: date })
      .returning();
    record = created;
  }

  getIO().emit("footfall-update", {
  facilityId: record.facilityId,
  department: record.department,
  count: record.count,
});

  res.status(201).json({
    id: record.id,
    facilityId: record.facilityId,
    department: record.department,
    count: record.count,
    logDate: record.logDate,
    createdAt: record.createdAt.toISOString(),
  });
});

export default router;
