
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load user's posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/posts/mine");
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Posts load nahi ho sake. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Delete post
  const deletePost = async (id) => {
    const confirmed = window.confirm(
      "Kya tum sach mein is post ko delete karna chahte ho?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await api.delete(`/posts/${id}`);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Post delete nahi hui. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Post statistics
  const totalPosts = posts.length;

  const publishedPosts = posts.filter(
    (post) => post.status === "published"
  ).length;

  const draftPosts = posts.filter(
    (post) => post.status === "draft"
  ).length;

  return (
    <main className="container dashboard-page">
      {/* Dashboard Header */}
      <div className="section-head">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>Dashboard</h1>
          <p>Manage your stories and keep creating.</p>
        </div>

        <Link className="btn" to="/editor/new">
          + New post
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error" role="alert">
          <span>{error}</span>

          <button
            className="btn small"
            type="button"
            onClick={loadPosts}
            disabled={loading}
          >
            Try again
          </button>
        </div>
      )}

      {/* Dashboard Statistics */}
      <section className="dashboard-stats" aria-label="Post statistics">
        <article className="stat-card">
          <span>Total posts</span>
          <strong>{totalPosts}</strong>
        </article>

        <article className="stat-card">
          <span>Published</span>
          <strong>{publishedPosts}</strong>
        </article>

        <article className="stat-card">
          <span>Drafts</span>
          <strong>{draftPosts}</strong>
        </article>
      </section>

      {/* Articles Heading */}
      <div className="section-head">
        <h2>Your articles</h2>

        <button
          className="btn small"
          type="button"
          onClick={loadPosts}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Posts Content */}
      {loading ? (
        <div className="center" role="status">
          Loading your posts...
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <div className="empty">
          <h3>Your writing journey starts here.</h3>
          <p>You haven't created any posts yet.</p>

          <Link className="btn" to="/editor/new">
            Write your first post
          </Link>
        </div>
      ) : (
        /* Posts List */
        <div className="dashboard">
          {posts.map((post) => (
            <article className="row" key={post._id}>
              <div className="post-info">
                <span className={`status ${post.status || "unknown"}`}>
                  {post.status || "unknown"}
                </span>

                <h3>{post.title || "Untitled post"}</h3>

                <small>
                  Updated{" "}
                  {post.updatedAt
                    ? new Date(post.updatedAt).toLocaleDateString()
                    : "recently"}
                </small>
              </div>

              <div className="post-actions">
                {/* Edit */}
                <Link
                  className="btn small"
                  to={`/editor/${post._id}`}
                >
                  Edit
                </Link>

                {/* View */}
                {post.status === "published" && post.slug && (
                  <Link
                    className="btn small"
                    to={`/post/${post.slug}`}
                  >
                    View
                  </Link>
                )}

                {/* Delete */}
                <button
                  className="btn small"
                  type="button"
                  disabled={deletingId === post._id}
                  onClick={() => deletePost(post._id)}
                >
                  {deletingId === post._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
