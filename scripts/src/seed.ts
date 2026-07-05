import { db, districtsTable, facilitiesTable, usersTable, medicinesTable, stockRecordsTable, stockTransactionsTable, patientFootfallTable, bedsTable, doctorsTable, doctorAttendanceTable, testsTable, testAvailabilityTable, alertsTable } from "@workspace/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Shared reference data (medicines & tests are global/catalog-level, matching
// the original file's behavior — not duplicated per district).
// ---------------------------------------------------------------------------

const medicineData = [
  { name: "Paracetamol 500mg", category: "Analgesic", unit: "tablets", reorderThresholdDays: 7 },
  { name: "Amoxicillin 250mg", category: "Antibiotic", unit: "capsules", reorderThresholdDays: 10 },
  { name: "ORS Packets", category: "Rehydration", unit: "packets", reorderThresholdDays: 5 },
  { name: "Metformin 500mg", category: "Antidiabetic", unit: "tablets", reorderThresholdDays: 14 },
  { name: "Atenolol 50mg", category: "Antihypertensive", unit: "tablets", reorderThresholdDays: 14 },
  { name: "Albendazole 400mg", category: "Antiparasitic", unit: "tablets", reorderThresholdDays: 21 },
  { name: "Iron + Folic Acid", category: "Nutritional", unit: "tablets", reorderThresholdDays: 10 },
  { name: "Vitamin A (200,000 IU)", category: "Vitamin", unit: "capsules", reorderThresholdDays: 30 },
  { name: "Ciprofloxacin 500mg", category: "Antibiotic", unit: "tablets", reorderThresholdDays: 10 },
  { name: "Salbutamol Inhaler", category: "Bronchodilator", unit: "inhalers", reorderThresholdDays: 14 },
  { name: "Insulin Vials", category: "Antidiabetic", unit: "vials", reorderThresholdDays: 7 },
  { name: "Chloroquine 250mg", category: "Antimalarial", unit: "tablets", reorderThresholdDays: 21 },
  { name: "Gentamicin Eye Drops", category: "Ophthalmic", unit: "bottles", reorderThresholdDays: 14 },
  { name: "Dextrose 5% (500ml)", category: "IV Fluid", unit: "bottles", reorderThresholdDays: 5 },
  { name: "Normal Saline (500ml)", category: "IV Fluid", unit: "bottles", reorderThresholdDays: 5 },
];

const testData = [
  { name: "Complete Blood Count (CBC)", category: "Hematology" },
  { name: "Blood Sugar (Random)", category: "Biochemistry" },
  { name: "Urine Routine", category: "Microbiology" },
  { name: "Malaria Card Test", category: "Serology" },
  { name: "HIV Rapid Test", category: "Serology" },
  { name: "Sputum AFB (TB)", category: "Microbiology" },
  { name: "Pregnancy Test (urine)", category: "Serology" },
  { name: "Widal Test", category: "Serology" },
  { name: "Liver Function Test", category: "Biochemistry" },
  { name: "Dengue NS1 Antigen", category: "Serology" },
];

const wardData = [
  { ward: "General Ward", totalRatio: 0.5, occupiedRatio: 0.7 },
  { ward: "Emergency", totalRatio: 0.2, occupiedRatio: 0.85 },
  { ward: "Maternity", totalRatio: 0.2, occupiedRatio: 0.5 },
  { ward: "Pediatric", totalRatio: 0.1, occupiedRatio: 0.6 },
];

const stockVariants: Array<[number, number]> = [
  // [currentQty, avgDailyConsumption] - varies by facility
  [500, 25], [80, 15], [200, 8], [150, 5], [120, 4],
  [600, 12], [300, 20], [90, 3], [45, 18], [30, 5],
  [400, 30], [200, 10], [60, 4], [25, 8], [180, 15],
];

const departments = ["OPD", "Emergency", "ANC", "Pediatric", "General"];

// ---------------------------------------------------------------------------
// Per-district seed data
// ---------------------------------------------------------------------------

type FacilitySeed = {
  name: string;
  type: "PHC" | "CHC" | "DH";
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  inchargeName: string;
  totalBedCapacity: number;
};

type UserSeed = {
  username: string;
  name: string;
  role: "district_admin" | "facility_staff" | "citizen";
  facilityIndex: number | null; // index into that district's facilities array, or null
  isAdmin?: boolean;
  languagePref: "en" | "hi" | "bn";
};

type DistrictSeed = {
  districtName: string;
  state: string;
  facilities: FacilitySeed[];
  users: UserSeed[];
  doctorsByFacility: Array<Array<{ name: string; spec: string }>>;
  lowStockFacilityIndexes: number[]; // facilities that get deliberately low stock for demo purposes
  alertFacilityIndexes: { critical: number; warning: number };
};

const hooghlyDistrict: DistrictSeed = {
  districtName: "Hooghly",
  state: "West Bengal",
  facilities: [
    { name: "Rishra PHC", type: "PHC", address: "Rishra, Hooghly", latitude: 22.9913, longitude: 88.3397, phone: "033-2672-1234", inchargeName: "Dr. A. Mukherjee", totalBedCapacity: 30 },
    { name: "Shrirampur CHC", type: "CHC", address: "Shrirampur, Hooghly", latitude: 22.7559, longitude: 88.3418, phone: "033-2660-5678", inchargeName: "Dr. B. Das", totalBedCapacity: 80 },
    { name: "Chinsurah District Hospital", type: "DH", address: "Chinsurah, Hooghly", latitude: 22.8907, longitude: 88.3905, phone: "033-2682-9012", inchargeName: "Dr. C. Roy", totalBedCapacity: 250 },
    { name: "Arambagh PHC", type: "PHC", address: "Arambagh, Hooghly", latitude: 22.8620, longitude: 87.7885, phone: "033-2684-3456", inchargeName: "Dr. D. Sen", totalBedCapacity: 20 },
    { name: "Chandannagar CHC", type: "CHC", address: "Chandannagar, Hooghly", latitude: 22.8675, longitude: 88.3733, phone: "033-2683-7890", inchargeName: "Dr. E. Banerjee", totalBedCapacity: 60 },
    { name: "Tarakeshwar PHC", type: "PHC", address: "Tarakeshwar, Hooghly", latitude: 22.8870, longitude: 88.0171, phone: "033-2676-2345", inchargeName: "Dr. F. Ghosh", totalBedCapacity: 25 },
  ],
  users: [
    { username: "admin_hooghly", name: "District Admin", role: "district_admin", facilityIndex: null, isAdmin: true, languagePref: "en" },
    { username: "rishra_phc", name: "Rishra Staff", role: "facility_staff", facilityIndex: 0, languagePref: "bn" },
    { username: "shrirampur_chc", name: "Shrirampur Staff", role: "facility_staff", facilityIndex: 1, languagePref: "hi" },
    { username: "chinsurah_dh", name: "Chinsurah Staff", role: "facility_staff", facilityIndex: 2, languagePref: "en" },
    { username: "arambagh_phc", name: "Arambagh Staff", role: "facility_staff", facilityIndex: 3, languagePref: "en" },
    { username: "citizen_demo", name: "Citizen User", role: "citizen", facilityIndex: null, languagePref: "en" },
  ],
  doctorsByFacility: [
    [{ name: "Dr. Priya Sharma", spec: "General Medicine" }, { name: "Dr. Rahul Dey", spec: "Pediatrics" }],
    [{ name: "Dr. Anjali Bose", spec: "Obstetrics" }, { name: "Dr. Suresh Patel", spec: "Surgery" }, { name: "Dr. Meena Roy", spec: "General Medicine" }],
    [{ name: "Dr. Arun Kumar", spec: "Medicine" }, { name: "Dr. Sita Das", spec: "Gynecology" }, { name: "Dr. Raj Verma", spec: "Orthopedics" }, { name: "Dr. Lily Sen", spec: "Pediatrics" }],
    [{ name: "Dr. Kartik Ghosh", spec: "General Medicine" }],
    [{ name: "Dr. Nandita Mukherjee", spec: "Internal Medicine" }, { name: "Dr. Arnab Paul", spec: "ENT" }],
    [{ name: "Dr. Dipika Mondal", spec: "General Medicine" }, { name: "Dr. Trishna Sarkar", spec: "Obstetrics" }],
  ],
  lowStockFacilityIndexes: [0, 3],
  alertFacilityIndexes: { critical: 0, warning: 3 },
};

const howrahDistrict: DistrictSeed = {
  districtName: "Howrah",
  state: "West Bengal",
  facilities: [
    { name: "Howrah City Hospital", type: "DH", address: "Howrah Maidan, Howrah", latitude: 22.5892, longitude: 88.3103, phone: "033-2637-1111", inchargeName: "Dr. S. Chatterjee", totalBedCapacity: 220 },
    { name: "Bally CHC", type: "CHC", address: "Bally, Howrah", latitude: 22.6486, longitude: 88.3400, phone: "033-2650-2222", inchargeName: "Dr. R. Banerjee", totalBedCapacity: 70 },
    { name: "Uluberia PHC", type: "PHC", address: "Uluberia, Howrah", latitude: 22.4756, longitude: 88.1097, phone: "033-2660-3333", inchargeName: "Dr. M. Khan", totalBedCapacity: 25 },
    { name: "Domjur PHC", type: "PHC", address: "Domjur, Howrah", latitude: 22.6167, longitude: 88.1833, phone: "033-2655-4444", inchargeName: "Dr. T. Halder", totalBedCapacity: 20 },
    { name: "Panchla CHC", type: "CHC", address: "Panchla, Howrah", latitude: 22.5417, longitude: 88.0833, phone: "033-2683-5555", inchargeName: "Dr. N. Adak", totalBedCapacity: 55 },
    { name: "Shyampur PHC", type: "PHC", address: "Shyampur, Howrah", latitude: 22.2333, longitude: 88.1500, phone: "033-2213-6666", inchargeName: "Dr. P. Maity", totalBedCapacity: 18 },
    { name: "Amta PHC", type: "PHC", address: "Amta, Howrah", latitude: 22.5333, longitude: 88.0167, phone: "033-2691-7777", inchargeName: "Dr. J. Samanta", totalBedCapacity: 22 },
  ],
  users: [
    { username: "admin_howrah", name: "Howrah District Admin", role: "district_admin", facilityIndex: null, isAdmin: true, languagePref: "en" },
    { username: "howrah_city_hospital", name: "Howrah City Hospital Staff", role: "facility_staff", facilityIndex: 0, languagePref: "bn" },
    { username: "bally_chc", name: "Bally Staff", role: "facility_staff", facilityIndex: 1, languagePref: "hi" },
    { username: "uluberia_phc", name: "Uluberia Staff", role: "facility_staff", facilityIndex: 2, languagePref: "bn" },
    { username: "domjur_phc", name: "Domjur Staff", role: "facility_staff", facilityIndex: 3, languagePref: "en" },
    { username: "panchla_chc", name: "Panchla Staff", role: "facility_staff", facilityIndex: 4, languagePref: "bn" },
    { username: "citizen_demo_howrah", name: "Citizen User (Howrah)", role: "citizen", facilityIndex: null, languagePref: "en" },
  ],
  doctorsByFacility: [
    [{ name: "Dr. Souvik Chatterjee", spec: "General Medicine" }, { name: "Dr. Ritika Banerjee", spec: "Surgery" }, { name: "Dr. Amit Ghoshal", spec: "Orthopedics" }, { name: "Dr. Farha Khan", spec: "Gynecology" }],
    [{ name: "Dr. Rajesh Banerjee", spec: "Internal Medicine" }, { name: "Dr. Shreya Dutta", spec: "Pediatrics" }, { name: "Dr. Manoj Halder", spec: "General Medicine" }],
    [{ name: "Dr. Mehnaz Khan", spec: "General Medicine" }, { name: "Dr. Biplab Adak", spec: "Obstetrics" }],
    [{ name: "Dr. Tapas Halder", spec: "General Medicine" }],
    [{ name: "Dr. Nilanjan Adak", spec: "General Medicine" }, { name: "Dr. Sudeshna Maity", spec: "Pediatrics" }],
    [{ name: "Dr. Piyali Maity", spec: "General Medicine" }],
    [{ name: "Dr. Joydeep Samanta", spec: "General Medicine" }, { name: "Dr. Ananya Samanta", spec: "ANM/Nursing" }],
  ],
  lowStockFacilityIndexes: [2, 5],
  alertFacilityIndexes: { critical: 2, warning: 5 },
};

// ---------------------------------------------------------------------------
// Seed logic (parameterized per district)
// ---------------------------------------------------------------------------

async function seedDistrict(
  district: DistrictSeed,
  medicines: Array<{ id: number; name: string }>,
  testIds: number[],
  passwordHash: string,
  adminHash: string,
) {
  // --- District ---
  const [insertedDistrict] = await db
    .insert(districtsTable)
    .values({ name: district.districtName, state: district.state })
    .onConflictDoNothing()
    .returning();

  const districtId =
    insertedDistrict?.id ??
    (await db.select().from(districtsTable).where(eq(districtsTable.name, district.districtName)))[0].id;
  console.log(`✓ District (${district.districtName}):`, districtId);

  // --- Facilities ---
  const facilities: Array<{ id: number; name: string }> = [];
  for (const f of district.facilities) {
    const existing = await db.select().from(facilitiesTable).where(eq(facilitiesTable.name, f.name));
    if (existing.length > 0) {
      facilities.push({ id: existing[0].id, name: existing[0].name });
      continue;
    }
    const [created] = await db
      .insert(facilitiesTable)
      .values({ ...f, districtId })
      .returning();
    facilities.push({ id: created.id, name: created.name });
  }
  console.log(`✓ Facilities (${district.districtName}):`, facilities.length);

  // --- Users ---
  const userData = district.users.map((u) => ({
    username: u.username,
    name: u.name,
    role: u.role,
    facilityId: u.facilityIndex !== null ? facilities[u.facilityIndex].id : null,
    passwordHash: u.isAdmin ? adminHash : passwordHash,
    languagePref: u.languagePref,
  }));

  for (const u of userData) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, u.username));
    if (existing.length === 0) {
      await db.insert(usersTable).values(u);
    }
  }
  console.log(`✓ Users seeded (${district.districtName})`);

  // --- Stock Records ---
  for (let fIdx = 0; fIdx < facilities.length; fIdx++) {
    const fac = facilities[fIdx];
    for (let mIdx = 0; mIdx < medicines.length; mIdx++) {
      const med = medicines[mIdx];
      const existing = await db
        .select()
        .from(stockRecordsTable)
        .where(eq(stockRecordsTable.facilityId, fac.id));
      if (existing.some((r) => r.medicineId === med.id)) continue;

      const [qty, avg] = stockVariants[(fIdx * 3 + mIdx) % stockVariants.length];
      // Deliberately low stock on flagged facilities for demo purposes
      const lowMultiplier = district.lowStockFacilityIndexes.includes(fIdx) && mIdx % 3 === 0 ? 0.08 : 1;
      await db.insert(stockRecordsTable).values({
        facilityId: fac.id,
        medicineId: med.id,
        currentQuantity: Math.max(1, Math.round(qty * lowMultiplier)),
        avgDailyConsumption: avg,
      });
    }
  }
  console.log(`✓ Stock records seeded (${district.districtName})`);

  // --- Beds ---
  for (const fac of facilities) {
    const existingBeds = await db.select().from(bedsTable).where(eq(bedsTable.facilityId, fac.id));
    if (existingBeds.length > 0) continue;

    const [facilityRecord] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, fac.id));
    const capacity = facilityRecord.totalBedCapacity;

    for (const ward of wardData) {
      const total = Math.max(2, Math.round(capacity * ward.totalRatio));
      const occupied = Math.round(total * ward.occupiedRatio);
      await db.insert(bedsTable).values({
        facilityId: fac.id,
        wardName: ward.ward,
        totalBeds: total,
        occupiedBeds: occupied,
      });
    }
  }
  console.log(`✓ Beds seeded (${district.districtName})`);

  // --- Doctors ---
  const doctorIds: number[] = [];
  for (let fIdx = 0; fIdx < facilities.length; fIdx++) {
    const fac = facilities[fIdx];
    const docList = district.doctorsByFacility[fIdx] ?? [];

    const existingDocs = await db.select().from(doctorsTable).where(eq(doctorsTable.facilityId, fac.id));
    if (existingDocs.length > 0) {
      doctorIds.push(...existingDocs.map((d) => d.id));
      continue;
    }

    for (const doc of docList) {
      const [created] = await db.insert(doctorsTable).values({
        facilityId: fac.id,
        name: doc.name,
        specialization: doc.spec,
      }).returning();
      doctorIds.push(created.id);
    }
  }
  console.log(`✓ Doctors (${district.districtName}):`, doctorIds.length);

  // --- Doctor Attendance (today) ---
  const today = new Date().toISOString().split("T")[0];
  for (const fac of facilities) {
    const docs = await db.select().from(doctorsTable).where(eq(doctorsTable.facilityId, fac.id));
    for (let dIdx = 0; dIdx < docs.length; dIdx++) {
      const doc = docs[dIdx];
      const existing = await db
        .select()
        .from(doctorAttendanceTable)
        .where(eq(doctorAttendanceTable.doctorId, doc.id));
      if (existing.some((a) => a.attendanceDate === today)) continue;
      const status = dIdx % 5 === 0 ? "absent" : dIdx % 7 === 3 ? "late" : "present";
      const checkIn = status === "absent" ? null : `${8 + Math.floor(Math.random() * 2)}:${Math.random() > 0.5 ? "00" : "30"}`;
      await db.insert(doctorAttendanceTable).values({
        doctorId: doc.id, facilityId: fac.id, attendanceDate: today, status, checkInTime: checkIn,
      });
    }
  }
  console.log(`✓ Attendance seeded (${district.districtName})`);

  // --- Test Availability ---
  for (const fac of facilities) {
    const existingTA = await db.select().from(testAvailabilityTable).where(eq(testAvailabilityTable.facilityId, fac.id));
    if (existingTA.length > 0) continue;

    for (let tIdx = 0; tIdx < testIds.length; tIdx++) {
      const statusOpts: Array<"available" | "unavailable" | "equipment_down"> = ["available", "available", "available", "unavailable", "equipment_down"];
      const status = statusOpts[tIdx % statusOpts.length];
      await db.insert(testAvailabilityTable).values({
        facilityId: fac.id, testId: testIds[tIdx], status,
      });
    }
  }
  console.log(`✓ Tests seeded (${district.districtName})`);

  // --- Patient Footfall (last 30 days) ---
  for (const fac of facilities) {
    for (let d = 29; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];

      const existing = await db
        .select()
        .from(patientFootfallTable)
        .where(eq(patientFootfallTable.facilityId, fac.id));
      if (existing.some((f) => f.logDate === dateStr)) continue;

      for (const dept of departments) {
        const baseCount = dept === "OPD" ? 45 : dept === "Emergency" ? 12 : dept === "ANC" ? 8 : dept === "Pediatric" ? 18 : 20;
        const count = Math.max(1, Math.round(baseCount + (Math.random() - 0.5) * baseCount * 0.4));
        await db.insert(patientFootfallTable).values({
          facilityId: fac.id, department: dept, count, logDate: dateStr,
        });
      }
    }
  }
  console.log(`✓ Footfall seeded (${district.districtName})`);

  // --- Sample Alerts ---
  const existingAlerts = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.facilityId, facilities[district.alertFacilityIndexes.critical].id));
  if (existingAlerts.length === 0) {
    const criticalFac = facilities[district.alertFacilityIndexes.critical];
    const warningFac = facilities[district.alertFacilityIndexes.warning];
    await db.insert(alertsTable).values([
      { facilityId: criticalFac.id, type: "stock_critical", severity: "critical", message: `${criticalFac.name}: Paracetamol stock critically low (2 days remaining)`, isRead: false },
      { facilityId: warningFac.id, type: "stock_low", severity: "warning", message: `${warningFac.name}: 3 medicines below reorder threshold`, isRead: false },
    ]);
  }
  console.log(`✓ Alerts seeded (${district.districtName})`);

  return { facilities, userData };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding database…");

  // --- Shared catalog data: Medicines ---
  const medicines: Array<{ id: number; name: string }> = [];
  for (const m of medicineData) {
    const existing = await db.select().from(medicinesTable).where(eq(medicinesTable.name, m.name));
    if (existing.length > 0) {
      medicines.push({ id: existing[0].id, name: existing[0].name });
    } else {
      const [created] = await db.insert(medicinesTable).values(m).returning();
      medicines.push({ id: created.id, name: created.name });
    }
  }
  console.log("✓ Medicines (shared catalog):", medicines.length);

  // --- Shared catalog data: Tests ---
  const testIds: number[] = [];
  for (const t of testData) {
    const existing = await db.select().from(testsTable).where(eq(testsTable.name, t.name));
    if (existing.length > 0) {
      testIds.push(existing[0].id);
    } else {
      const [created] = await db.insert(testsTable).values(t).returning();
      testIds.push(created.id);
    }
  }
  console.log("✓ Tests (shared catalog):", testIds.length);

  // --- Shared passwords ---
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const adminHash = await bcrypt.hash("admin1234", 10);

  // --- Seed each district ---
  await seedDistrict(hooghlyDistrict, medicines, testIds, passwordHash, adminHash);
  await seedDistrict(howrahDistrict, medicines, testIds, passwordHash, adminHash);

  console.log("\n✅ Seed complete! Demo accounts:");
  console.log("  --- Hooghly ---");
  console.log("  admin_hooghly / admin1234  (District Admin)");
  console.log("  rishra_phc / demo1234  (PHC Staff)");
  console.log("  shrirampur_chc / demo1234  (CHC Staff)");
  console.log("  chinsurah_dh / demo1234  (District Hospital Staff)");
  console.log("  arambagh_phc / demo1234  (PHC Staff)");
  console.log("  citizen_demo / demo1234  (Citizen)");
  console.log("  --- Howrah ---");
  console.log("  admin_howrah / admin1234  (District Admin)");
  console.log("  howrah_city_hospital / demo1234  (District Hospital Staff)");
  console.log("  bally_chc / demo1234  (CHC Staff)");
  console.log("  uluberia_phc / demo1234  (PHC Staff)");
  console.log("  domjur_phc / demo1234  (PHC Staff)");
  console.log("  panchla_chc / demo1234  (CHC Staff)");
  console.log("  citizen_demo_howrah / demo1234  (Citizen)");
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
