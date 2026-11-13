
import { Router } from "express";
import {
  toggleLike,
  listComments,
  addComment,
  updateComment,
  deleteComment,
  toggleBookmark,
  myBookmarks,
} from "../controllers/interactionController.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

router.get("/bookmarks", protect, myBookmarks);

router.post("/posts/:id/like", protect, toggleLike);

router.get("/posts/:id/comments", listComments);
router.post("/posts/:id/comments", protect, addComment);

router.put("/comments/:id", protect, updateComment);
router.delete("/comments/:id", protect, deleteComment);

router.post("/posts/:id/bookmark", protect, toggleBookmark);

export default router;
