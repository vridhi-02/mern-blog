import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogsList from "./pages/BlogsList";
import CreateBlog from "./pages/CreateBlog";
import BlogDetails from "./pages/BlogDetails";
import EditBlog from "./pages/EditBlog";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ Admin dashboard

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin")); // ✅ Parse boolean value correctly

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Route: Profile */}
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Admin Protected Route */}
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Authenticated Routes */}
        <Route
          path="/bloglist"
          element={isAuthenticated ? <BlogsList /> : <Navigate to="/login" />}
        />
        <Route
          path="/create"
          element={isAuthenticated ? <CreateBlog /> : <Navigate to="/login" />}
        />
        <Route
          path="/blogs/:id"
          element={isAuthenticated ? <BlogDetails /> : <Navigate to="/login" />}
        />
        <Route
          path="/blogs/edit/:id"
          element={isAuthenticated ? <EditBlog /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
