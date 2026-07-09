import React, { useEffect, useState } from "react";
import "./dashbord.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";

const Dashbord = () => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProgress() {
    try {
      const { data } = await axios.get(`${server}/api/progress/overall`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setProgressData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="student-dashboard">
      <h2>Welcome Back to Your Dashboard</h2>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Enrolled Courses</h3>
          <div className="stat-value">{progressData?.totalEnrolled || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Completed Courses</h3>
          <div className="stat-value">{progressData?.completedCourses || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Study Progress</h3>
          <div className="stat-value">
            {progressData?.totalEnrolled > 0
              ? Math.round(
                  (progressData.completedCourses / progressData.totalEnrolled) * 100
                )
              : 0}
            %
          </div>
        </div>
      </div>

      <h3 className="dashboard-section-title">My Courses & Learning Progress</h3>

      <div className="dashboard-content">
        {progressData?.overallProgress && progressData.overallProgress.length > 0 ? (
          progressData.overallProgress.map((prog) => (
            <div key={prog.courseId} className="dashboard-course-item">
              <img
                src={prog.courseImage && prog.courseImage.startsWith("http") ? prog.courseImage : `${server}/${prog.courseImage}`}
                alt={prog.courseTitle}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <div className="progress-container">
                <h4 style={{ margin: "0 0 10px 0", fontSize: "1.2rem", fontWeight: "600" }}>
                  {prog.courseTitle}
                </h4>
                
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${prog.percentage}%` }}
                  ></div>
                </div>

                <div className="progress-info">
                  <span>
                    {prog.completedCount} / {prog.totalLectures} Lectures
                  </span>
                  <span className="progress-percentage">{prog.percentage}%</span>
                </div>

                <button
                  className="start-study-btn"
                  onClick={() => navigate(`/course/study/${prog.courseId}`)}
                >
                  {prog.percentage === 100 ? "Review Course" : "Continue Studying"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px" }}>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
              You haven't enrolled in any courses yet.
            </p>
            <button
              className="common-btn"
              onClick={() => navigate("/courses")}
              style={{ marginTop: "15px" }}
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashbord;
