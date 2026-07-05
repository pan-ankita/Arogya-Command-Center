import { Router, type IRouter } from "express";
import { db, medicinesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/medicines", async (req, res): Promise<void> => {
  const medicines = await db.select().from(medicinesTable).orderBy(medicinesTable.name);
  res.json(medicines.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    unit: m.unit,
    reorderThresholdDays: m.reorderThresholdDays,
  })));
});

export default router;
