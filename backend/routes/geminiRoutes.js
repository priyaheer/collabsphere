import express from "express";
import rateLimit from "express-rate-limit";
import { explain, docs, readme } from "../controllers/geminiController.js";
import { explainValidator, docsValidator, readmeValidator } from "../validators/geminiValidators.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// AI calls are expensive - rate-limit per user/IP to control cost and abuse.
const geminiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please slow down.", errors: [] },
});

router.use(protect, geminiLimiter);
router.post("/explain", explainValidator, explain);
router.post("/docs", docsValidator, docs);
router.post("/readme", readmeValidator, readme);

export default router;
