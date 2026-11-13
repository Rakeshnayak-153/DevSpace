
import React from "react";
import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return (
    <article className="card">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title || "Article cover"} />
      )}

      <div className="card-body">
        <div className="tags">
          {post.tags?.map((tag) => (
            <Link key={tag._id} to={`/tag/${tag.slug}`}>
              #{tag.name}
            </Link>
          ))}
        </div>

        <h2>
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>

        <p>
          {post.excerpt || (post.content || "").slice(0, 180)}
          ...
        </p>

        <small>
          By {post.author?.name || "Unknown author"} ·{" "}
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString()
            : ""}
        </small>
      </div>
    </article>
  );
}
