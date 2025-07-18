import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
  });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    axios
      .get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setUpdatedAt(res.data.updatedAt);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile.");
        navigate("/login");
      });
  }, [navigate, token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Save changes?",
      text: "Do you want to update your profile?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.put("http://localhost:5000/api/users/me", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdatedAt(res.data.updatedAt);
      toast.success("Profile updated!");
      navigate("/bloglist");
    } catch (error) {
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      toast.success("Account deleted");
      navigate("/register");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#fff8e1]">
        <p className="text-lg text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-10 flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-1"> Your Profile</h2>
          
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-300 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us something about yourself..."
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-300 outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="text-sm text-red-600 hover:underline"
            >
              Delete my account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
