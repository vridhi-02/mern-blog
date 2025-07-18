import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaUserShield,
  FaTrash,
  FaTags,
  FaBlog,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    fetchBlogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data);
    } catch {
      toast.error("Failed to load blogs");
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Do you really want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      confirmButtonColor: "#e11d48",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      toast.success("Logged out");
      navigate("/login");
    }
  };

  const confirmDelete = async (type, id) => {
    const result = await Swal.fire({
      title: `Delete ${type}?`,
      text: `This will permanently delete the ${type}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: `Yes, delete ${type}`,
    });

    if (result.isConfirmed) {
      if (type === "user") deleteUser(id);
      if (type === "blog") deleteBlog(id);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const deleteBlog = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blog deleted");
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const categories = ["All", ...new Set(blogs.map((b) => b.category || "General"))];

  const filteredBlogs =
    categoryFilter === "All"
      ? blogs
      : blogs.filter((b) => (b.category || "General") === categoryFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-800 flex items-center gap-2">
            <FaUserShield className="text-orange-600" /> Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>

        {/* USERS */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-orange-700 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Users
            </h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search users…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded pl-10 pr-3 py-1.5 text-sm w-full shadow-sm focus:ring-2 focus:ring-orange-400"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-orange-100 p-4 rounded shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-orange-800">{user.username}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      user.isAdmin
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                {!user.isAdmin && (
                  <button
                    onClick={() => confirmDelete("user", user._id)}
                    className="mt-2 text-red-600 text-xs hover:underline flex items-center gap-1"
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No users found
              </p>
            )}
          </div>
        </section>

        {/* BLOGS */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-yellow-700 flex items-center gap-2">
              <FaBlog className="text-yellow-600" /> Blogs
            </h2>
            <div className="relative w-48">
              <FaTags className="absolute left-3 top-2.5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded pl-10 pr-3 py-1.5 text-sm w-full shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-yellow-100 p-4 rounded shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-medium text-yellow-800">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Author: {blog.user?.username || "N/A"}
                </p>
                <p className="text-xs mt-1">
                  Category:{" "}
                  <span className="text-yellow-700 font-medium">
                    {blog.category || "General"}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  👍 {blog.likesCount ?? 0} · 💬 {blog.commentsCount ?? 0}
                </p>
                <button
                  onClick={() => confirmDelete("blog", blog._id)}
                  className="mt-2 text-red-600 text-xs hover:underline flex items-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            ))}
            {filteredBlogs.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No blogs found in this category
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
