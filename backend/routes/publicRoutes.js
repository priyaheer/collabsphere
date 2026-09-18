import express from "express";
import { param } from "express-validator";
import { getPublicProject } from "../controllers/publicController.js";
import { withValidation } from "../middleware/validationMiddleware.js";

const router = express.Router();
const tokenValidator = withValidation(param("token").matches(/^[a-f0-9]{48}$/).withMessage("Invalid public project link"));

// No auth middleware here on purpose - this router is intentionally public.
router.get("/projects/:token", tokenValidator, getPublicProject);

export default router;
