import express from "express";
import { param } from "express-validator";
import { getPublicProject } from "../controllers/publicController.js";
import { withValidation } from "../middleware/validationMiddleware.js";

const router = express.Router();
const idValidator = withValidation(param("id").isMongoId().withMessage("Invalid project id"));

// No auth middleware here on purpose - this router is intentionally public.
router.get("/projects/:id", idValidator, getPublicProject);

export default router;
