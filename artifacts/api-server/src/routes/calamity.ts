import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, calamityAlertsTable, facilitiesTable, alertsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/calamity", async (req, res): Promise<void> => {
  const facilityId = req.query.facilityId ? parseInt(req.query.facilityId as string, 10) : null;

  let calamities;
  if (facilityId) {
    calamities = await db
      .select()
      .from(calamityAlertsTable)
      .where(eq(calamityAlertsTable.facilityId, facilityId))
      .orderBy(calamityAlertsTable.triggeredAt);
  } else {
    calamities = await db
      .select()
      .from(calamityAlertsTable)
      .where(eq(calamityAlertsTable.isActive, true))
      .orderBy(calamityAlertsTable.triggeredAt);
  }

  const facilities = await db.select().from(facilitiesTable);
  const facMap = new Map(facilities.map((f) => [f.id, f.name]));

  res.json(calamities.map((c) => ({
    id: c.id,
    facilityId: c.facilityId,
    facilityName: facMap.get(c.facilityId) ?? null,
    type: c.type,
    severity: c.severity,
    description: c.description ?? null,
    isActive: c.isActive,
    triggeredAt: c.triggeredAt.toISOString(),
    resolvedAt: c.resolvedAt?.toISOString() ?? null,
  })));
});

router.post("/calamity", async (req, res): Promise<void> => {
  const { facilityId, type, severity, description } = req.body;
  const userId = req.session?.userId ?? null;

  if (!facilityId || !type || !severity) {
    res.status(400).json({ error: "facilityId, type, severity required" });
    return;
  }

  const [calamity] = await db
    .insert(calamityAlertsTable)
    .values({
      facilityId,
      type,
      severity,
      description: description ?? null,
      triggeredBy: userId,
      isActive: true,
    })
    .returning();

  const [fac] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, facilityId));

  await db.insert(alertsTable).values({
    facilityId,
    type: "calamity",
    severity: severity === "high" ? "critical" : severity === "medium" ? "warning" : "info",
    message: `Calamity declared at ${fac?.name ?? "facility"}: ${type} (${severity} severity)`,
    isRead: false,
  });

  res.status(201).json({
    id: calamity.id,
    facilityId: calamity.facilityId,
    facilityName: fac?.name ?? null,
    type: calamity.type,
    severity: calamity.severity,
    description: calamity.description ?? null,
    isActive: calamity.isActive,
    triggeredAt: calamity.triggeredAt.toISOString(),
    resolvedAt: null,
  });
});

router.post("/calamity/:id/resolve", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [calamity] = await db
    .update(calamityAlertsTable)
    .set({ isActive: false, resolvedAt: new Date() })
    .where(eq(calamityAlertsTable.id, id))
    .returning();

  if (!calamity) {
    res.status(404).json({ error: "Calamity not found" });
    return;
  }

  const [fac] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, calamity.facilityId));

  res.json({
    id: calamity.id,
    facilityId: calamity.facilityId,
    facilityName: fac?.name ?? null,
    type: calamity.type,
    severity: calamity.severity,
    description: calamity.description ?? null,
    isActive: calamity.isActive,
    triggeredAt: calamity.triggeredAt.toISOString(),
    resolvedAt: calamity.resolvedAt?.toISOString() ?? null,
  });
});

export default router;
