
import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Like or unlike a published post
export async function toggleLike(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findOne({
      _id: id,
      status: "published",
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = String(req.user._id);
    const alreadyLiked = post.likes.some(
      (likeId) => String(likeId) === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (likeId) => String(likeId) !== userId
      );
    } else {
      post.likes.addToSet(req.user._id);
    }

    await post.save();

    return res.json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update like" });
  }
}

// Get comments of a published post
export async function listComments(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findOne({
      _id: id,
      status: "published",
    }).populate("comments.author", "name avatarUrl");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post.comments);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load comments" });
  }
}

// Add a comment
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const text = req.body.text?.trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    if (!text || text.length > 2000) {
      return res.status(400).json({
        message: "Comment must contain 1 to 2000 characters",
      });
    }

    const post = await Post.findOne({
      _id: id,
      status: "published",
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      author: req.user._id,
      text,
    });

    await post.save();
    await post.populate("comments.author", "name avatarUrl");

    return res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    return res.status(500).json({ message: "Unable to add comment" });
  }
}

// Edit your own comment
export async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const text = req.body.text?.trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    if (!text || text.length > 2000) {
      return res.status(400).json({
        message: "Comment must contain 1 to 2000 characters",
      });
    }

    const post = await Post.findOne({
      "comments._id": id,
    });

    if (!post) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments.id(id);

    if (String(comment.author) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.text = text;
    await post.save();
    await post.populate("comments.author", "name avatarUrl");

    return res.json(comment);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update comment" });
  }
}

// Delete your own comment
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const post = await Post.findOne({
      "comments._id": id,
    });

    if (!post) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments.id(id);

    if (String(comment.author) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    comment.deleteOne();
    await post.save();

    return res.json({ message: "Comment deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete comment" });
  }
}

// Bookmark or remove bookmark
export async function toggleBookmark(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findOne({
      _id: id,
      status: "published",
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyBookmarked = user.bookmarks.some(
      (postId) => String(postId) === String(id)
    );

    if (alreadyBookmarked) {
      user.bookmarks.pull(id);
    } else {
      user.bookmarks.addToSet(id);
    }

    await user.save();

    return res.json({
      bookmarked: !alreadyBookmarked,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update bookmark" });
  }
}

// Get logged-in user's bookmarks
export async function myBookmarks(req, res) {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      match: { status: "published" },
      populate: [
        { path: "author", select: "name bio avatarUrl" },
        { path: "tags", select: "name slug" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.bookmarks.filter(Boolean));
  } catch (error) {
    return res.status(500).json({ message: "Unable to load bookmarks" });
  }
}
