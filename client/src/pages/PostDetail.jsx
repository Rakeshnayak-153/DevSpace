
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const userId = user?.id || user?._id;

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/posts/${slug}`);

        if (!active) return;

        const currentPost = response.data;
        setPost(currentPost);

        setLiked(
          (currentPost.likes || []).some(
            (id) => String(id?._id || id) === String(userId)
          )
        );

        const commentsResponse = await api.get(
          `/posts/${currentPost._id}/comments`
        );

        if (active) setComments(commentsResponse.data);

        if (userId) {
          try {
            const bookmarksResponse = await api.get("/bookmarks");
            const items =
              bookmarksResponse.data.bookmarks || bookmarksResponse.data;

            if (active) {
              setBookmarked(
                items.some(
                  (item) =>
                    String(item._id || item) === String(currentPost._id)
                )
              );
            }
          } catch {
            if (active) setBookmarked(false);
          }
        } else if (active) {
          setBookmarked(false);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load this post."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [slug, userId]);

  const requireLogin = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireLogin() || busy) return;

    setBusy(true);

    try {
      const { data } = await api.post(`/posts/${post._id}/like`);

      setLiked(data.liked);
      setPost((current) => ({
        ...current,
        likes: Array(data.likesCount).fill(null),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update like.");
    } finally {
      setBusy(false);
    }
  };

  const handleBookmark = async () => {
    if (!requireLogin() || busy) return;

    setBusy(true);

    try {
      const { data } = await api.post(`/posts/${post._id}/bookmark`);
      setBookmarked(data.bookmarked);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update bookmark.");
    } finally {
      setBusy(false);
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();

    if (!requireLogin()) return;

    const text = commentText.trim();
    if (!text) return;

    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, {
        text,
      });

      setComments((current) => [...current, data.comment]);
      setCommentText("");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add comment.");
    }
  };

  const handleEditComment = async (commentId) => {
    const text = editText.trim();
    if (!text) return;

    try {
      const { data } = await api.put(`/comments/${commentId}`, { text });

      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId ? data.comment : comment
        )
      );

      setEditingId(null);
      setEditText("");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to edit comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);

      setComments((current) =>
        current.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete comment.");
    }
  };

  if (loading) {
    return <div className="center">Loading...</div>;
  }

  if (error) {
    return <div className="center">{error}</div>;
  }

  if (!post) {
    return <div className="center">Post not found.</div>;
  }

  return (
    <main className="article">
      {post.coverImage && (
        <img className="cover" src={post.coverImage} alt="" />
      )}

      <div className="tags">
        {post.tags?.map((tag) => (
          <Link key={tag._id} to={`/tag/${tag.slug}`}>
            #{tag.name}
          </Link>
        ))}
      </div>

      <h1>{post.title}</h1>

      <p className="muted">
        By {post.author?.name || "Unknown"} ·{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {/* Like and Bookmark Buttons */}
      <div className="post-actions">
        <button
          type="button"
          className={`action-btn like-btn ${liked ? "active" : ""}`}
          onClick={handleLike}
          disabled={busy}
        >
          {liked ? "❤️ Liked" : "🤍 Like"} ({post.likes?.length || 0})
        </button>

        <button
          type="button"
          className={`action-btn bookmark-btn ${
            bookmarked ? "active" : ""
          }`}
          onClick={handleBookmark}
          disabled={busy}
        >
          {bookmarked ? "🔖 Bookmarked" : "📑 Bookmark"}
        </button>
      </div>

      {/* Blog Content */}
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {post.content}
      </ReactMarkdown>

      {/* Comments Section */}
      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        <form onSubmit={handleComment}>
          <textarea
            className="comment-input"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={user ? "Write a comment..." : "Login to comment"}
            maxLength={2000}
            rows={3}
          />

          <button
            type="submit"
            className="comment-submit"
            disabled={!commentText.trim()}
          >
            Post Comment
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 && (
            <p className="muted">No comments yet. Be the first!</p>
          )}

          {comments.map((comment) => {
            const authorId =
              comment.author?._id ||
              comment.author?.id ||
              comment.author;

            const isOwner =
              userId && String(authorId) === String(userId);

            return (
              <article className="comment" key={comment._id}>
                <p>
                  <strong>{comment.author?.name || "User"}</strong>
                  <span className="muted">
                    {" "}
                    · {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </p>

                {editingId === comment._id ? (
                  <>
                    <textarea
                      className="comment-input"
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      maxLength={2000}
                    />

                    <button
                      type="button"
                      className="comment-submit"
                      onClick={() => handleEditComment(comment._id)}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className="comment-cancel"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <p>{comment.text}</p>
                )}

                {isOwner && editingId !== comment._id && (
                  <div className="comment-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditText(comment.text);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
