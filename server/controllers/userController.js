import User from "../models/User.js";
import Post from "../models/Post.js";

export async function publicProfile(req, res) {
  const user = await User.findById(req.params.id).select("name bio avatarUrl createdAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  const posts = await Post.find({ author: user._id, status: "published" }).populate("tags", "name slug").sort({ createdAt: -1 });
  res.json({ user, posts });
}

export async function updateMe(req, res) {
  const { name, bio, avatarUrl } = req.body;
  const user = await User.findById(req.user._id);
  if (name?.trim()) user.name = name.trim();
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl } });
}