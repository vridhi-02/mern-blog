import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formType, setFormType] = useState(""); // "", "login", "register"

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsLoggedIn(true);
        setBlogs(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      });
  }, []);

  // Register state
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [registerError, setRegisterError] = useState("");

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", registerForm);
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      setFormType("");
      const blogsRes = await axios.get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      setBlogs(blogsRes.data);
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Registration failed");
    }
  };

  // Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", loginForm);
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      setFormType("");
      const blogsRes = await axios.get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      setBlogs(blogsRes.data);
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-white to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Blog</h1>
            {!isLoggedIn && (
              <div className="space-x-4">
                {formType === "" && (
                  <>
                    <button
                      onClick={() => setFormType("login")}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Sign In
                    </button>
                    
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoggedIn ? (
          blogs.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, idx) => (
                <article
                  key={idx}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-3">{blog.content}</p>
                    <div className="mt-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Read more
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">No blogs found.</p>
          )
        ) : formType === "register" ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-xl">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Create Account</h2>
              {registerError && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {registerError}
                </div>
              )}
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <input name="username" placeholder="Username" required onChange={handleRegisterChange} className="w-full border rounded-lg px-4 py-3" />
                <input name="email" type="email" placeholder="Email" required onChange={handleRegisterChange} className="w-full border rounded-lg px-4 py-3" />
                <input name="password" type="password" placeholder="Password" required onChange={handleRegisterChange} className="w-full border rounded-lg px-4 py-3" />
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">Sign Up</button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button onClick={() => setFormType("login")} className="text-blue-600 hover:underline">
                  Sign In
                </button>
              </p>
              
            </div>
          </div>
        ) : formType === "login" ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
              {loginError && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <input name="email" type="email" placeholder="Email" required onChange={handleLoginChange} className="w-full border rounded-lg px-4 py-3" />
                <input name="password" type="password" placeholder="Password" required onChange={handleLoginChange} className="w-full border rounded-lg px-4 py-3" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg">Sign In</button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <button onClick={() => setFormType("register")} className="text-indigo-600 hover:underline">
                  Sign Up
                </button>
              </p>
              
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to My Blog!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Sign in to explore blog posts or create an account to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
