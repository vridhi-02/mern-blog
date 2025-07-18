import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const token = localStorage.getItem("token");

  const safelySetBlog = (data) => {
    data.tags = Array.isArray(data.tags) ? data.tags : [];
    data.comments = Array.isArray(data.comments) ? data.comments : [];
    data.likes = Array.isArray(data.likes) ? data.likes : [];
    setBlog(data);
  };

  useEffect(() => {
    if (!token) {
      navigate("/bloglist");
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decoded.id);
    } catch {
      toast.error("Invalid token, please login again.");
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        safelySetBlog(res.data);
      } catch {
        toast.error("Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, token, navigate]);

  useEffect(() => {
    if (location.state?.updated) {
      toast.success("Blog updated successfully!");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ SAFELY HANDLE blog.user even if null or string
  const blogAuthorId = blog?.user
    ? typeof blog.user === "object"
      ? blog.user._id
      : blog.user
    : null;

  const isBlogAuthor = blogAuthorId === currentUserId;

  const handleLike = async () => {
    const result = await Swal.fire({
      title: blog.likes.includes(currentUserId) ? "Unlike this blog?" : "Like this blog?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: blog.likes.includes(currentUserId) ? "Unlike" : "Like",
    });

    if (!result.isConfirmed) return;

    setLikeLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/blogs/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(blog.likes.includes(currentUserId) ? "Unliked successfully!" : "Liked successfully!");
      const res = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      safelySetBlog(res.data);
    } catch {
      toast.error("Failed to update like.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Comment cannot be empty.");

    const result = await Swal.fire({
      title: "Post this comment?",
      text: comment,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Post",
    });

    if (!result.isConfirmed) return;

    setCommentLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/blogs/${id}/comments`, { text: comment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Comment posted!");
      const res = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      safelySetBlog(res.data);
      setComment("");
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this blog?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blog deleted successfully!");
      navigate("/bloglist");
    } catch {
      toast.error("Failed to delete blog.");
    }
  };

  if (!token)
    return <p className="p-8 text-center text-red-500">Please log in to view this blog.</p>;
  if (loading || !blog)
    return <p className="p-8 text-center text-gray-600">Loading blog…</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex justify-between items-center">
          <Link to="/bloglist" className="text-amber-600 hover:underline font-medium">
            ← Back to Blog List
          </Link>
          <h1 className="text-3xl font-bold text-orange-700 font-serif">Blog Details</h1>
        </header>

        <article className="bg-white shadow-xl rounded-3xl p-8 border border-yellow-100">
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{blog.title}</h2>
            {isBlogAuthor && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/blogs/edit/${id}`, { state: { fromDetails: true } })}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition flex items-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200 transition flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            by{" "}
            <span className="font-semibold">
              {typeof blog.user === "object" ? blog.user?.username : "Anonymous"}
            </span>
          </p>

          <div className="prose max-w-none text-gray-800 mb-6">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs rounded-full font-semibold tracking-wide"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleLike}
            disabled={likeLoading}
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-full hover:bg-amber-600 transition disabled:opacity-50"
          >
            <HandThumbUpIcon className="w-5 h-5" />
            {likeLoading
              ? "Processing..."
              : blog.likes.includes(currentUserId)
              ? `Unlike (${blog.likes.length})`
              : `Like (${blog.likes.length})`}
          </button>
        </article>

        <section className="bg-white p-6 shadow-md rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-5">Comments</h3>

          <div className="space-y-5">
            {blog.comments.length > 0 ? (
              blog.comments.map((c, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <p className="text-gray-700">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    by {c.user?.username || "Anonymous"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>

          <form onSubmit={handleComment} className="mt-8 flex gap-3">
            <input
              type="text"
              placeholder="Write a thoughtful comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={commentLoading}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              {commentLoading ? "Posting…" : "Post"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
