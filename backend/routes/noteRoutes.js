import express from "express";
import { createNote, getProjectNotes, getNote, updateNote, deleteNote } from "../controllers/noteController.js";
import { createNoteValidator, projectIdParamValidator, noteIdParamValidator, updateNoteValidator } from "../validators/noteValidators.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

// Mounted at /api/projects/:projectId/notes
export const projectNotesRouter = express.Router();
projectNotesRouter.post("/", protect, createNoteValidator, createNote);
projectNotesRouter.get("/", optionalAuth, projectIdParamValidator, getProjectNotes);

// Mounted at /api/notes
export const noteRouter = express.Router();
noteRouter.get("/:id", optionalAuth, noteIdParamValidator, getNote);
noteRouter.put("/:id", protect, updateNoteValidator, updateNote);
noteRouter.delete("/:id", protect, noteIdParamValidator, deleteNote);

export default noteRouter;
