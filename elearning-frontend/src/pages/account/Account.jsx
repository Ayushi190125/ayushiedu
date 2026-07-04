import React from "react";
import { MdDashboard, MdAdminPanelSettings } from "react-icons/md";
import "./account.css";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out Successfully");
    navigate("/login");
  };

  // Get user avatar initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="account-page-container">
      {user && (
        <div className="account-profile-card">
          <div className="profile-header-banner">
            <div className="profile-avatar-circle">
              {getInitials(user.name)}
            </div>
          </div>

          <div className="profile-details-section">
            <h2 className="profile-title">User Profile</h2>
            <div className="profile-badge">{user.role || "student"}</div>

            <div className="info-fields-grid">
              <div className="info-field-row">
                <span className="field-label">Name</span>
                <span className="field-value">{user.name}</span>
              </div>

              <div className="info-field-row">
                <span className="field-label">Email Address</span>
                <span className="field-value">{user.email}</span>
              </div>
            </div>

            <div className="profile-actions-wrapper">
              <button
                onClick={() => navigate(`/${user._id}/dashboard`)}
                className="profile-btn dashboard-btn"
              >
                <MdDashboard size={20} />
                <span>Go to Dashboard</span>
              </button>

              {user.role === "admin" && (
                <button
                  onClick={() => navigate(`/admin/dashboard`)}
                  className="profile-btn admin-btn"
                >
                  <MdAdminPanelSettings size={20} />
                  <span>Admin Workspace</span>
                </button>
              )}

              <button
                onClick={logoutHandler}
                className="profile-btn logout-btn"
              >
                <IoMdLogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
