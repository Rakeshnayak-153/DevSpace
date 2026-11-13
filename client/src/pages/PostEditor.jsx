import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../api/axios.js";

const initialForm = {
  title: "",
  content: "",
  coverImage: "",
  tags: "",
  status: "draft",
};

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get("/posts/mine");
        const posts = Array.isArray(response.data) ? response.data : [];
        const post = posts.find((item) => item._id === id);

        if (!post) {
          if (active) {
            setError("Post nahi mili. Dashboard se dobara try karo.");
          }
          return;
        }

        if (active) {
          setForm({
            title: post.title || "",
            content: post.content || "",
            coverImage: post.coverImage || "",
            tags: Array.isArray(post.tags)
              ? post.tags
                  .map((tag) =>
                    typeof tag === "string" ? tag : tag.name
                  )
                  .filter(Boolean)
                  .join(", ")
              : "",
            status: post.status || "draft",
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Post load nahi hui. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const savePost = async (status) => {
    if (saving) return;

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) {
      setError("Please apne article ka title likho.");
      return;
    }

    if (!content) {
      setError("Please article ka content likho.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        ...form,
        title,
        content,
        status,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (editing) {
        await api.put(`/posts/${id}`, body);
      } else {
        await api.post("/posts", body);
      }

      setSuccess(
        status === "published"
          ? "Article publish ho gaya!"
          : "Draft save ho gaya!"
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Post save nahi hui. Please dobara try karo."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="center" role="status">
          Loading editor...
        </div>
      </main>
    );
  }

  return (
    <main className="editor container">
      <div className="section-head">
        <div>
          <span className="eyebrow">DEVSPACE EDITOR</span>
          <h1>{editing ? "Edit your story" : "Write a new story"}</h1>
          <p>Turn your ideas into something worth sharing.</p>
        </div>

        <div className="editor-actions">
          <button
            type="button"
            disabled={saving}
            onClick={() => savePost("draft")}
          >
            {saving ? "Saving..." : "Save draft"}
          </button>

          <button
            className="primary"
            type="button"
            disabled={saving}
            onClick={() => savePost("published")}
          >
            {saving ? "Please wait..." : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success" role="status">
          {success}
        </div>
      )}

      <section className="editor-form">
        <label htmlFor="post-title">Article title</label>
        <input
          id="post-title"
          className="title-input"
          name="title"
          placeholder="Give your story a great title..."
          value={form.title}
          onChange={updateField}
          maxLength={200}
        />

        <label htmlFor="post-cover">Cover image URL (optional)</label>
        <input
          id="post-cover"
          name="coverImage"
          type="url"
          placeholder="https://example.com/cover.jpg"
          value={form.coverImage}
          onChange={updateField}
        />

        <label htmlFor="post-tags">Tags</label>
        <input
          id="post-tags"
          name="tags"
          placeholder="React, JavaScript, Web Development"
          value={form.tags}
          onChange={updateField}
        />

        <div className="editor-grid">
          <div className="editor-writing">
            <label htmlFor="post-content">Your article (Markdown supported)</label>
            <textarea
              id="post-content"
              name="content"
              placeholder={
                "# Your headline\n\nStart writing your story here...\n\n## What you will learn\n\n- First point\n- Second point"
              }
              value={form.content}
              onChange={updateField}
              rows={20}
            />
          </div>

          <div className="preview">
            <span className="eyebrow">LIVE PREVIEW</span>

            {form.content.trim() ? (
              <ReactMarkdown>{form.content}</ReactMarkdown>
            ) : (
              <p>Your article preview will appear here as you write.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}