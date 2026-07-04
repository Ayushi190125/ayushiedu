import React, { useEffect } from "react";
import "./coursestudy.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  return (
    <>
      {course && (
        <div className="course-study-container">
          <div className="course-study-card">
            <div className="course-study-image-wrapper">
              <img src={`${course.image}`} alt={course.title} />
              <div className="course-study-badge">Enrolled</div>
            </div>
            
            <div className="course-study-content">
              <h2 className="course-study-title">{course.title}</h2>
              <p className="course-study-desc">{course.description}</p>
              
              <div className="course-study-meta">
                <div className="meta-item">
                  <span className="meta-icon">👨‍🏫</span>
                  <span className="meta-text">
                    Instructor: <strong>{course.createdBy}</strong>
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">
                    Duration: <strong>{course.duration} months</strong>
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/lectures/${course._id}`)} 
                className="course-study-btn"
              >
                🚀 Start Learning Lectures
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStudy;
