import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { MagnifyingGlassIcon, TagIcon, PencilSquareIcon } from "@heroicons/react/24/solid";

export default function BlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]); // ✅ state for category list

  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, logout",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      toast.success("You have successfully logged out.");
      navigate("/");
    }
  };

  const fetchBlogs = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, category },
      })
      .then((res) => {
        setBlogs(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  };

  // ✅ Fetch categories on mount
  const fetchCategories = () => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));
  };

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [search, category]);

  return (
    <div className="min-h-screen bg-[#fff8e1] relative">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-orange-600">Blogging</h1>
          <div className="flex gap-4">
            <Link to="/profile" className="text-orange-600 hover:text-orange-800 font-medium">
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Category */}
            <div className="relative w-full sm:w-48">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-orange-200 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {(search || category) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="text-sm text-gray-500 hover:underline self-center"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Write Button */}
          <Link
            to="/create"
            className="hidden sm:inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
          >
            + Write Blog
          </Link>
        </div>

        {/* Blog List */}
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading blogs…</p>
        ) : blogs.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="relative bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 p-6"
              >
                <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {blog.category || "General"}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">{blog.title}</h2>

                <div
                  className="text-sm text-gray-600 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      blog.content?.length > 120
                        ? blog.content.slice(0, 120) + "..."
                        : blog.content,
                  }}
                />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-500">
                    {blog.likes?.length || 0} Likes
                  </span>
                  <Link
                    to={`/blogs/${blog._id}`}
                    className="text-sm bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 hover:shadow-md transform hover:scale-105 transition duration-200"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No blogs found yet.</p>
        )}
      </main>

      {/* Floating Write Button (Mobile) */}
      <Link
        to="/create"
        className="sm:hidden fixed bottom-5 right-5 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition duration-200"
      >
        <PencilSquareIcon className="w-6 h-6" />
      </Link>
    </div>
  );
}
