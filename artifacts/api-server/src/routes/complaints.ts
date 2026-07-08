import { Router, type IRouter } from "express";
import { db, complaintsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/complaints", async (req, res): Promise<void> => {
  try {
    const { email, description, imageUrl } = req.body;

    if (!email || !description) {
      res.status(400).json({
        message: "Email and description are required.",
      });
      return;
    }

    const [complaint] = await db
      .insert(complaintsTable)
      .values({
        email,
        description,
        imageUrl: imageUrl ?? null,
      })
      .returning();

    res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;