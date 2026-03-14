import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [newName, setNewName] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setNewName(data.name);
        setPhotoPreview(data.profile_photo || null);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    let photoBase64 = user.profile_photo;

    if (photoFile) {
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);

      reader.onloadend = async () => {
        photoBase64 = reader.result;

        await fetch("http://127.0.0.1:8000/profile/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newName,
            profile_photo: photoBase64
          })
        });

        alert("Profile updated successfully!");
        window.location.reload();
      };
    } else {
      await fetch("http://127.0.0.1:8000/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          profile_photo: photoBase64
        })
      });

      alert("Profile updated successfully!");
      window.location.reload();
    }
  };

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://127.0.0.1:8000/profile/change-password",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      }
    );

    const data = await res.json();
    alert(data.message);
    setChangingPassword(false);
  };

  if (!user) return <p className="loading-text">Loading your profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div className="profile-avatar">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <p className="profile-tagline">
            Premium Member • Smart Shopper 🛍️
          </p>
        </div>

        {/* INFO */}
        <div className="profile-info">
          <div className="info-item">
            <span>📅 Joined</span>
            <strong>
              {new Date(user.joined_at).toLocaleDateString()}
            </strong>
          </div>

          <div className="info-item">
            <span>🔍 Total Searches</span>
            <strong>{user.total_searches}</strong>
          </div>
        </div>

        {/* EDIT PROFILE */}
        {editing && (
          <div className="form-section">
            <h3>✏️ Edit Profile</h3>

            <label>Full Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <label>Upload Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

            <button onClick={handleUpdate}>
              Save Changes
            </button>
          </div>
        )}

        {/* CHANGE PASSWORD */}
        {changingPassword && (
          <div className="form-section">
            <h3>🔐 Change Password</h3>

            <label>Current Password</label>
            <input
              type="password"
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <label>New Password</label>
            <input
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button onClick={handlePasswordChange}>
              Update Password
            </button>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          <button onClick={() => setEditing(!editing)}>
            Edit Profile
          </button>

          <button onClick={() => setChangingPassword(!changingPassword)}>
            Change Password
          </button>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/compare")}
          >
            Back to Compare
          </button>
        </div>

      </div>
    </div>
  );
}
