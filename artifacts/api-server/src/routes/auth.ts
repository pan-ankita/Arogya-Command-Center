import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, usersTable, facilitiesTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.facilityId = user.facilityId ?? null;

  let facilityName: string | null = null;
  if (user.facilityId) {
    const [fac] = await db
      .select()
      .from(facilitiesTable)
      .where(eq(facilitiesTable.id, user.facilityId));
    facilityName = fac?.name ?? null;
  }

  req.log.info({ userId: user.id, role: user.role }, "User logged in");

  res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    facilityId: user.facilityId ?? null,
    facilityName,
    languagePref: user.languagePref,
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Session destroy error");
    }
  });
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "User not found" });
    return;
  }

  let facilityName: string | null = null;
  if (user.facilityId) {
    const [fac] = await db
      .select()
      .from(facilitiesTable)
      .where(eq(facilitiesTable.id, user.facilityId));
    facilityName = fac?.name ?? null;
  }

  res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    facilityId: user.facilityId ?? null,
    facilityName,
    languagePref: user.languagePref,
  });
});

export default router;
