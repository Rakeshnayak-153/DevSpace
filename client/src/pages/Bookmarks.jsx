
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/bookmarks");
      setPosts(Array.isArray(data) ? data : data.bookmarks || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load bookmarks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const removeBookmark = async (postId) => {
    try {
      await api.post(`/posts/${postId}/bookmark`);

      setPosts((current) =>
        current.filter((post) => post._id !== postId)
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to remove bookmark."
      );
    }
  };

  if (loading) {
    return <div className="center">Loading bookmarks...</div>;
  }

  if (error) {
    return <div className="center">{error}</div>;
  }

  return (
    <main className="bookmarks-page">
      <div className="bookmarks-heading">
        <h1>My Bookmarks 🔖</h1>
        <p className="muted">
          All your saved articles in one place.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bookmarks-empty">
          <h2>No bookmarks yet!</h2>
          <p className="muted">
            Save your favourite articles and find them here.
          </p>
          <Link className="btn" to="/">
            Explore Blogs
          </Link>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {posts.map((post) => (
            <article className="bookmark-card" key={post._id}>
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="bookmark-cover"
                />
              )}

              <div className="bookmark-content">
                <div className="tags">
                  {post.tags?.map((tag) => (
                    <Link key={tag._id} to={`/tag/${tag.slug}`}>
                      #{tag.name}
                    </Link>
                  ))}
                </div>

                <h2>
                  <Link to={`/post/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="muted">
                  By {post.author?.name || "Unknown"}
                </p>

                <p>
                  {post.excerpt ||
                    `${post.content?.slice(0, 140) || ""}...`}
                </p>

                <div className="bookmark-actions">
                  <Link
                    className="btn"
                    to={`/post/${post.slug}`}
                  >
                    Read Article
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeBookmark(post._id)}
                  >
                    Remove 🔖
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
