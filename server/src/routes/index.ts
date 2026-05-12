import { Router } from "express";
import authRoutes from "./auth.routes";
import mfaRoutes from "./mfa.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/mfa", mfaRoutes);

export default router;
