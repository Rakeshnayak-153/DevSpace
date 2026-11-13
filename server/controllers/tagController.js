import Tag from "../models/Tag.js";
import Post from "../models/Post.js";

export async function listTags(req, res) {
  const tags = await Tag.find().sort({ name: 1 }).lean();
  const counts = await Post.aggregate([{ $match: { status: "published" } }, { $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map(x => [String(x._id), x.count]));
  res.json(tags.map(t => ({ ...t, postCount: map[String(t._id)] || 0 })));
}