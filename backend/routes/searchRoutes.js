import express from "express";
import { query } from "express-validator";
import { searchWorkspace } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { withValidation } from "../middleware/validationMiddleware.js";

const router = express.Router();
const searchValidator = withValidation(query("q").optional().isString().isLength({ max: 100 }));

router.get("/", protect, searchValidator, searchWorkspace);

export default router;