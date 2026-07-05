import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bedsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/beds", async (req, res): Promise<void> => {
  const facilityId = parseInt(req.query.facilityId as string, 10);
  if (isNaN(facilityId)) {
    res.status(400).json({ error: "facilityId required" });
    return;
  }

  const beds = await db.select().from(bedsTable).where(eq(bedsTable.facilityId, facilityId));

  res.json(beds.map((b) => ({
    id: b.id,
    facilityId: b.facilityId,
    wardName: b.wardName,
    totalBeds: b.totalBeds,
    occupiedBeds: b.occupiedBeds,
    availableBeds: b.totalBeds - b.occupiedBeds,
    lastUpdatedAt: b.lastUpdatedAt.toISOString(),
  })));
});

router.patch("/beds/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { occupiedBeds } = req.body;

  if (isNaN(id) || occupiedBeds == null) {
    res.status(400).json({ error: "id and occupiedBeds required" });
    return;
  }

  const [bed] = await db
    .update(bedsTable)
    .set({ occupiedBeds, lastUpdatedAt: new Date() })
    .where(eq(bedsTable.id, id))
    .returning();

  if (!bed) {
    res.status(404).json({ error: "Bed not found" });
    return;
  }

  res.json({
    id: bed.id,
    facilityId: bed.facilityId,
    wardName: bed.wardName,
    totalBeds: bed.totalBeds,
    occupiedBeds: bed.occupiedBeds,
    availableBeds: bed.totalBeds - bed.occupiedBeds,
    lastUpdatedAt: bed.lastUpdatedAt.toISOString(),
  });
});

export default router;
