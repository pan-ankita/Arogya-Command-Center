import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, doctorsTable, doctorAttendanceTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/doctors", async (req, res): Promise<void> => {
  const facilityId = parseInt(req.query.facilityId as string, 10);
  if (isNaN(facilityId)) {
    res.status(400).json({ error: "facilityId required" });
    return;
  }

  const doctors = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.facilityId, facilityId))
    .orderBy(doctorsTable.name);

  res.json(doctors.map((d) => ({
    id: d.id,
    facilityId: d.facilityId,
    name: d.name,
    specialization: d.specialization,
    scheduledDays: d.scheduledDays,
  })));
});

router.get("/attendance", async (req, res): Promise<void> => {
  const facilityId = parseInt(req.query.facilityId as string, 10);
  if (isNaN(facilityId)) {
    res.status(400).json({ error: "facilityId required" });
    return;
  }
  const date = (req.query.date as string) ?? new Date().toISOString().split("T")[0];

  const records = await db
    .select({
      id: doctorAttendanceTable.id,
      doctorId: doctorAttendanceTable.doctorId,
      facilityId: doctorAttendanceTable.facilityId,
      attendanceDate: doctorAttendanceTable.attendanceDate,
      status: doctorAttendanceTable.status,
      checkInTime: doctorAttendanceTable.checkInTime,
      doctorName: doctorsTable.name,
    })
    .from(doctorAttendanceTable)
    .leftJoin(doctorsTable, eq(doctorAttendanceTable.doctorId, doctorsTable.id))
    .where(and(
      eq(doctorAttendanceTable.facilityId, facilityId),
      eq(doctorAttendanceTable.attendanceDate, date)
    ));

  res.json(records.map((r) => ({
    id: r.id,
    doctorId: r.doctorId,
    facilityId: r.facilityId,
    doctorName: r.doctorName ?? "",
    attendanceDate: r.attendanceDate,
    status: r.status,
    checkInTime: r.checkInTime ?? null,
  })));
});

router.post("/attendance/mark", async (req, res): Promise<void> => {
  const { doctorId, facilityId, status, checkInTime, attendanceDate } = req.body;
  if (!doctorId || !facilityId || !status) {
    res.status(400).json({ error: "doctorId, facilityId, status required" });
    return;
  }

  const date = attendanceDate ?? new Date().toISOString().split("T")[0];

  const [existing] = await db
    .select()
    .from(doctorAttendanceTable)
    .where(and(
      eq(doctorAttendanceTable.doctorId, doctorId),
      eq(doctorAttendanceTable.facilityId, facilityId),
      eq(doctorAttendanceTable.attendanceDate, date)
    ));

  let record;
  if (existing) {
    const [updated] = await db
      .update(doctorAttendanceTable)
      .set({ status, checkInTime: checkInTime ?? null })
      .where(eq(doctorAttendanceTable.id, existing.id))
      .returning();
    record = updated;
  } else {
    const [created] = await db
      .insert(doctorAttendanceTable)
      .values({ doctorId, facilityId, status, checkInTime: checkInTime ?? null, attendanceDate: date })
      .returning();
    record = created;
  }

  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, doctorId));

  res.status(201).json({
    id: record.id,
    doctorId: record.doctorId,
    facilityId: record.facilityId,
    doctorName: doctor?.name ?? "",
    attendanceDate: record.attendanceDate,
    status: record.status,
    checkInTime: record.checkInTime ?? null,
  });
});

export default router;
