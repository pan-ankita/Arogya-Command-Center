import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, stockRecordsTable, stockTransactionsTable, medicinesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stock", async (req, res): Promise<void> => {
  const facilityId = parseInt(req.query.facilityId as string, 10);
  if (isNaN(facilityId)) {
    res.status(400).json({ error: "facilityId required" });
    return;
  }

  const records = await db
    .select({
      id: stockRecordsTable.id,
      facilityId: stockRecordsTable.facilityId,
      medicineId: stockRecordsTable.medicineId,
      currentQuantity: stockRecordsTable.currentQuantity,
      avgDailyConsumption: stockRecordsTable.avgDailyConsumption,
      lastUpdatedAt: stockRecordsTable.lastUpdatedAt,
      medicineName: medicinesTable.name,
      category: medicinesTable.category,
      unit: medicinesTable.unit,
    })
    .from(stockRecordsTable)
    .leftJoin(medicinesTable, eq(stockRecordsTable.medicineId, medicinesTable.id))
    .where(eq(stockRecordsTable.facilityId, facilityId))
    .orderBy(medicinesTable.name);

  const result = records.map((r) => {
    const daysRemaining =
      r.avgDailyConsumption && r.avgDailyConsumption > 0
        ? Math.floor(r.currentQuantity / r.avgDailyConsumption)
        : null;
    let stockStatus: string = "ok";
    if (daysRemaining !== null) {
      if (daysRemaining <= 0) stockStatus = "out";
      else if (daysRemaining <= 3) stockStatus = "critical";
      else if (daysRemaining <= 7) stockStatus = "low";
    }
    return {
      id: r.id,
      facilityId: r.facilityId,
      medicineId: r.medicineId,
      medicineName: r.medicineName ?? "",
      category: r.category ?? "",
      currentQuantity: r.currentQuantity,
      unit: r.unit ?? "",
      avgDailyConsumption: r.avgDailyConsumption,
      daysRemaining,
      lastUpdatedAt: r.lastUpdatedAt.toISOString(),
      stockStatus,
    };
  });

  res.json(result);
});

router.post("/stock/transaction", async (req, res): Promise<void> => {
  const { facilityId, medicineId, type, quantity, note } = req.body;
  if (!facilityId || !medicineId || !type || quantity == null) {
    res.status(400).json({ error: "facilityId, medicineId, type, quantity required" });
    return;
  }

  await db.insert(stockTransactionsTable).values({
    facilityId,
    medicineId,
    type,
    quantity,
    note,
  });

  const [existing] = await db
    .select()
    .from(stockRecordsTable)
    .where(and(eq(stockRecordsTable.facilityId, facilityId), eq(stockRecordsTable.medicineId, medicineId)));

  let newQty = existing?.currentQuantity ?? 0;
  if (type === "restock" || type === "transfer_in") {
    newQty += quantity;
  } else {
    newQty = Math.max(0, newQty - quantity);
  }

  let updatedRecord;
  if (existing) {
    const [updated] = await db
      .update(stockRecordsTable)
      .set({ currentQuantity: newQty, lastUpdatedAt: new Date() })
      .where(eq(stockRecordsTable.id, existing.id))
      .returning();
    updatedRecord = updated;
  } else {
    const [created] = await db
      .insert(stockRecordsTable)
      .values({ facilityId, medicineId, currentQuantity: newQty })
      .returning();
    updatedRecord = created;
  }

  const [med] = await db.select().from(medicinesTable).where(eq(medicinesTable.id, medicineId));

  const daysRemaining =
    updatedRecord.avgDailyConsumption > 0
      ? Math.floor(updatedRecord.currentQuantity / updatedRecord.avgDailyConsumption)
      : null;

  res.status(201).json({
    id: updatedRecord.id,
    facilityId: updatedRecord.facilityId,
    medicineId: updatedRecord.medicineId,
    medicineName: med?.name ?? "",
    category: med?.category ?? "",
    currentQuantity: updatedRecord.currentQuantity,
    unit: med?.unit ?? "",
    avgDailyConsumption: updatedRecord.avgDailyConsumption,
    daysRemaining,
    lastUpdatedAt: updatedRecord.lastUpdatedAt.toISOString(),
    stockStatus: daysRemaining !== null ? (daysRemaining <= 0 ? "out" : daysRemaining <= 3 ? "critical" : daysRemaining <= 7 ? "low" : "ok") : "ok",
  });
});

export default router;
