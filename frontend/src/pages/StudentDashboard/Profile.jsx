import React, { useState } from "react";

const Profile = ({ profile, userId }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });


      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        setSuccess("");
      } else {
        setSuccess(data.message);
        setError("");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Something went wrong, please try again");
    }
  };

  return (
    <div className="w-full bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-lg border border-green-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-t-2xl"></div>
        <h2 className="text-2xl font-bold text-green-700 mb-8 text-center">
          My Profile
        </h2>

        {profile ? (
          <div className="space-y-4">
            {[
              { label: "Full Name", value: profile.full_name },
              { label: "Seat Number", value: profile.seat_number },
              { label: "Program", value: profile.program },
              { label: "Department", value: profile.department },
              { label: "Current Semester", value: profile.current_sem_no },
            ].map((field, idx) => (
              <div key={idx} className="flex items-center justify-center">
                <label className="w-40 font-medium text-gray-700">
                  {field.label}:
                </label>
                <input
                  type="text"
                  value={field.value || ""}
                  readOnly
                  className="w-full max-w-md bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Loading profile...</p>
        )}

        <div className="my-8 h-px bg-gradient-to-r from-gray-200 via-green-200 to-gray-200"></div>

        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Change Password
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <label className="w-40 font-medium text-gray-700">
              Old Password:
            </label>
            <input
              type="password"
              placeholder="Enter old password"
              className="w-full max-w-md bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center">
            <label className="w-40 font-medium text-gray-700">
              New Password:
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full max-w-md bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (e.target.value.length < 6) {
                  setError("Password must be at least 6 characters long");
                } else {
                  setError("");
                }
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-3 text-center font-medium">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm mt-3 text-center font-medium">
            {success}
          </p>
        )}

        <div className="text-center">
          <button
            onClick={handleChangePassword}
            className="mt-6 bg-green-600 text-white font-medium px-6 py-2 rounded-lg shadow-md 
                       hover:bg-green-700 hover:shadow-lg transition transform hover:scale-105"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
