import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { PencilIcon, TagIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    if (!category.trim()) {
      toast.error("Please enter a category.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirm Publish",
      text: "Are you sure you want to publish this blog?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, publish it!",
    });

    if (!confirm.isConfirmed) {
      toast("Publishing cancelled.", { icon: "❌" });
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Publishing blog…");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title,
        content,
        category: category.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
      };

      await axios.post("http://localhost:5000/api/blogs", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Blog published successfully!", { id: toastId });
      navigate("/bloglist");
    } catch (error) {
      toast.error("Failed to publish blog.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      ["clean"],
    ],
  };

  return (
    <div className="min-h-screen bg-[#fffbea] flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full bg-white shadow-md hover:shadow-lg transition rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-[#f59e0b]">
          Write a New Blog
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative">
              <PencilIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-[#fbbf24] focus:border-[#fbbf24] outline-none"
                type="text"
                placeholder="Your blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <TagIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Type or select category"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-[#fbbf24] focus:border-[#fbbf24] outline-none"
              />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="relative">
              <DocumentTextIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-[#fbbf24] focus:border-[#fbbf24] outline-none"
                type="text"
                placeholder="Comma-separated tags (e.g. travel, life)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="bg-white rounded border border-gray-300"
              style={{ minHeight: "200px" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f59e0b] text-white font-medium py-2 rounded hover:bg-[#d97706] transition-colors disabled:opacity-50"
          >
            {loading ? "Publishing…" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
