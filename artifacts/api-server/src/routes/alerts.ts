import { Router, type IRouter } from "express";
import { eq, gte, and } from "drizzle-orm";
import { db, alertsTable, facilitiesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const facilityId = req.query.facilityId ? parseInt(req.query.facilityId as string, 10) : null;
  const since = req.query.since as string | undefined;
  const severity = req.query.severity as string | undefined;

  let alerts = await db
    .select()
    .from(alertsTable)
    .orderBy(alertsTable.createdAt);

  if (facilityId) {
    alerts = alerts.filter((a) => a.facilityId === facilityId);
  }
  if (since) {
    const sinceDate = new Date(since);
    alerts = alerts.filter((a) => a.createdAt > sinceDate);
  }
  if (severity) {
    alerts = alerts.filter((a) => a.severity === severity);
  }

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f.name]));

  res.json(alerts.reverse().map((a) => ({
    id: a.id,
    facilityId: a.facilityId ?? null,
    facilityName: a.facilityId ? (facMap.get(a.facilityId) ?? null) : null,
    type: a.type,
    severity: a.severity,
    message: a.message,
    isRead: a.isRead,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.patch("/alerts/:id/read", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [alert] = await db
    .update(alertsTable)
    .set({ isRead: true })
    .where(eq(alertsTable.id, id))
    .returning();

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f.name]));

  res.json({
    id: alert.id,
    facilityId: alert.facilityId ?? null,
    facilityName: alert.facilityId ? (facMap.get(alert.facilityId) ?? null) : null,
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    isRead: alert.isRead,
    createdAt: alert.createdAt.toISOString(),
  });
});

export default router;
