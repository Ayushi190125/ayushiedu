import React, { useEffect, useState } from "react";
import "./teacher.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";

const TeacherDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  if (user && user.role !== "teacher" && user.role !== "admin") {
    navigate("/");
    return null;
  }

  async function fetchTeacherStats() {
    try {
      const { data } = await axios.get(`${server}/api/teacher/dashboard`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching teacher stats:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="teacher-dashboard">
      <h2>Teacher Workspace</h2>

      {/* Stats Cards */}
      <div className="teacher-stats-grid">
        <div className="teacher-stat-card">
          <h3>Total Courses</h3>
          <div className="stat-value">{stats?.totalCourses || 0}</div>
        </div>
        <div className="teacher-stat-card">
          <h3>Active Students</h3>
          <div className="stat-value">{stats?.totalStudents || 0}</div>
        </div>
        <div className="teacher-stat-card">
          <h3>Total Lectures</h3>
          <div className="stat-value">{stats?.totalLectures || 0}</div>
        </div>
      </div>

      <div className="teacher-action-bar">
        <h3>My Created Courses</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="common-btn"
            style={{ margin: 0, background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)" }}
            onClick={() => navigate("/admin/course")}
          >
            Create New Course
          </button>
          <button
            className="common-btn"
            style={{ margin: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            onClick={() => navigate("/teacher/students")}
          >
            Manage Students
          </button>
        </div>
      </div>

      {stats?.courses && stats.courses.length > 0 ? (
        <table className="teacher-courses-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Category</th>
              <th>Duration (Months)</th>
              <th>Price</th>
              <th>Enrolled Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.courses.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.category}</td>
                <td>{course.duration}</td>
                <td>₹{course.price}</td>
                <td style={{ fontWeight: "bold", color: "#a855f7" }}>
                  {course.enrolledCount} Students
                </td>
                <td>
                  <button
                    className="common-btn"
                    style={{ margin: 0, fontSize: "14px", padding: "6px 12px" }}
                    onClick={() => navigate(`/lectures/${course._id}`)}
                  >
                    View Lectures
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
          <p style={{ color: "#94a3b8" }}>No courses created yet.</p>
          <button
            className="common-btn"
            style={{ marginTop: "15px" }}
            onClick={() => navigate("/admin/course")}
          >
            Create Your First Course
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
