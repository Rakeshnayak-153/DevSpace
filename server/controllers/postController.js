import Post from "../models/Post.js";
import Tag from "../models/Tag.js";
import slugify from "slugify";

async function uniqueSlug(title, ignoreId = null) {
  const base = slugify(title, { lower: true, strict: true }) || `post-${Date.now()}`;
  let slug = base, i = 1;
  while (await Post.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) slug = `${base}-${i++}`;
  return slug;
}

async function resolveTags(tags = []) {
  const names = [...new Set(tags.map(t => String(t).trim().toLowerCase()).filter(Boolean))];
  const ids = [];
  for (const name of names) {
    const slug = slugify(name, { lower: true, strict: true });
    const tag = await Tag.findOneAndUpdate({ slug }, { $setOnInsert: { name, slug } }, { upsert: true, new: true });
    ids.push(tag._id);
  }
  return ids;
}

export async function listPosts(req, res) {
  const { search = "", tag = "" } = req.query;
  const filter = { status: "published" };
  if (search) filter.title = { $regex: search, $options: "i" };
  if (tag) {
    const tagDoc = await Tag.findOne({ slug: tag });
    if (!tagDoc) return res.json([]);
    filter.tags = tagDoc._id;
  }
  const posts = await Post.find(filter).populate("author", "name bio avatarUrl").populate("tags", "name slug").sort({ createdAt: -1 });
  res.json(posts);
}

export async function getPost(req, res) {
  const post = await Post.findOne({ slug: req.params.slug, status: "published" })
    .populate("author", "name bio avatarUrl").populate("tags", "name slug");
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
}

export async function createPost(req, res) {
  const { title, content, coverImage = "", status = "draft", tags = [] } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: "Title and content are required" });
  const post = await Post.create({
    title: title.trim(),
    slug: await uniqueSlug(title),
    content,
    excerpt: content.replace(/[#*_`>\\[\\]]/g, "").replace(/\\s+/g, " ").trim().slice(0, 250),
    coverImage,
    status: status === "published" ? "published" : "draft",
    author: req.user._id,
    tags: await resolveTags(tags)
  });
  res.status(201).json(await post.populate([{ path: "author", select: "name bio avatarUrl" }, { path: "tags", select: "name slug" }]));
}

export async function updatePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only edit your own posts" });

  const { title, content, coverImage = "", status = "draft", tags = [] } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: "Title and content are required" });
  post.title = title.trim();
  post.content = content;
  post.coverImage = coverImage;
  post.status = status === "published" ? "published" : "draft";
  post.excerpt = content.replace(/[#*_`>\\[\\]]/g, "").replace(/\\s+/g, " ").trim().slice(0, 250);
  post.tags = await resolveTags(tags);
  if (title !== post.title) post.slug = await uniqueSlug(title, post._id);
  await post.save();
  res.json(await post.populate([{ path: "author", select: "name bio avatarUrl" }, { path: "tags", select: "name slug" }]));
}

export async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only delete your own posts" });
  await post.deleteOne();
  res.json({ message: "Post deleted" });
}

export async function myPosts(req, res) {
  const posts = await Post.find({ author: req.user._id }).populate("tags", "name slug").sort({ updatedAt: -1 });
  res.json(posts);
}