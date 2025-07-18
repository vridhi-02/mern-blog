import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const blogRes = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const blog = blogRes.data;
        setTitle(blog.title);
        setContent(blog.content);
        setCategory(blog.category || "");
        setTags(blog.tags?.join(", ") || "");

        const catRes = await axios.get("http://localhost:5000/api/categories");
        setCategories(catRes.data);
      } catch (err) {
        toast.error("Failed to load blog or categories");
        navigate("/bloglist");
      }
    };

    fetchData();
  }, [id, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update this blog?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f59e0b",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    const toastId = toast.loading("Updating blog...");

    try {
      const payload = {
        title,
        content,
        category: category.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      await axios.put(`http://localhost:5000/api/blogs/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Blog updated successfully!", { id: toastId });

      navigate(`/blogs/${id}`, { state: { updated: true } }); // 👈 trigger success toast in BlogDetails
    } catch (err) {
      toast.error("Failed to update blog", { id: toastId });
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
      <div className="max-w-2xl w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-[#f59e0b] mb-6">
          Edit Blog
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-[#fbbf24] focus:border-[#fbbf24] outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-[#fbbf24] focus:border-[#fbbf24] outline-none"
            />
            <datalist id="category-options">
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name} />
              ))}
            </datalist>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-[#fbbf24] focus:border-[#fbbf24] outline-none"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. travel, health"
            />
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
            {loading ? "Updating..." : "Update Blog"}
          </button>
        </form>
      </div>
    </div>
  );
}
