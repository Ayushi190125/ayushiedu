import React, { useEffect, useState } from "react";
import "./teacher.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";

const TeacherStudents = ({ user }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user && user.role !== "teacher" && user.role !== "admin") {
    navigate("/");
    return null;
  }

  async function fetchStudents() {
    try {
      const { data } = await axios.get(`${server}/api/teacher/students`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setStudents(data.students);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching teacher student progress:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="teacher-dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Enrolled Students Progress</h2>
        <button
          className="common-btn"
          style={{ margin: 0 }}
          onClick={() => navigate("/teacher/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {students && students.length > 0 ? (
        <div className="teacher-students-container">
          {students.map((student) => (
            <div key={student._id} className="student-progress-card">
              <div className="student-card-header">
                <div>
                  <h4>{student.name}</h4>
                  <p>{student.email}</p>
                </div>
                <div style={{ textTransform: "uppercase", fontSize: "0.85rem", tracking: "0.5px", color: "#3b82f6" }}>
                  Enrolled in {student.coursesEnrolled.length} of your courses
                </div>
              </div>

              <div className="student-course-progress-list">
                {student.coursesEnrolled.map((course) => {
                  const progressObj = student.progress.find(
                    (p) => p.course.toString() === course._id.toString()
                  );
                  const completedLecturesCount = progressObj
                    ? progressObj.completedLectures.length
                    : 0;

                  return (
                    <div key={course._id} className="student-course-progress-item">
                      <h5 style={{ margin: "0 0 10px 0", fontSize: "1.05rem", color: "#f1f5f9" }}>
                        {course.title}
                      </h5>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                        <span>Completed lectures: {completedLecturesCount}</span>
                        {progressObj?.completedAt && (
                          <span style={{ color: "#10b981", fontWeight: "bold" }}>Completed!</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
          <p style={{ color: "#94a3b8" }}>No students enrolled in your courses yet.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
