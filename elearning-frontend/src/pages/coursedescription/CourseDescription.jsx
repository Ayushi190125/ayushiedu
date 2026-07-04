import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [demoLecture, setDemoLecture] = useState(null);
  
  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, [params.id, fetchCourse]);

  // Fetch demo lecture
  async function fetchDemo() {
    try {
      const { data } = await axios.get(`${server}/api/course/${params.id}/demo`);
      setDemoLecture(data.lecture);
    } catch (error) {
      console.log("No demo video found for this course");
    }
  }

  useEffect(() => {
    fetchDemo();
  }, [params.id]);

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // Simulate a successful purchase without Razorpay
      const { data } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      // Simulate successful user and course fetching after purchase
      await fetchUser();
      await fetchCourses();
      await fetchMyCourse();

      toast.success(data.message || "Purchase successful!");
      navigate(`/`); // Navigate back home or to study page
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && course._id && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={course.image.startsWith("http") ? course.image : `${server}/${course.image}`}
                  alt={course.title}
                  className="course-image"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p><strong>Instructor:</strong> {course.createdBy}</p>
                  <p><strong>Duration:</strong> {course.duration} Months</p>
                  <p><strong>Category:</strong> {course.category}</p>
                </div>
              </div>

              <div className="course-desc-content">
                <p style={{ margin: 0 }}>{course.description}</p>
              </div>

              <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#a855f7" }}>
                Price: ₹{course.price}
              </p>

              <div style={{ margin: "20px 0" }}>
                {user && user.subscription.includes(course._id) ? (
                  <button
                    onClick={() => navigate(`/course/study/${course._id}`)}
                    className="common-btn"
                  >
                    Go to Course Study Space
                  </button>
                ) : (
                  <button onClick={checkoutHandler} className="common-btn">
                    Enroll Now / Buy Course
                  </button>
                )}
              </div>

              {/* Demo Lecture Module */}
              {demoLecture && (
                <div className="demo-lecture-section">
                  <h3>🎥 Watch Course Preview (Demo Lecture: {demoLecture.title})</h3>
                  <div className="demo-video-wrapper">
                    {demoLecture.video && (demoLecture.video.includes("youtube.com") || demoLecture.video.includes("youtu.be")) ? (
                      <iframe
                        width="100%"
                        height="400"
                        src={
                          demoLecture.video.includes("youtube.com/watch")
                            ? `https://www.youtube.com/embed/${new URLSearchParams(new URL(demoLecture.video).search).get("v")}`
                            : demoLecture.video.includes("youtu.be/")
                            ? `https://www.youtube.com/embed/${demoLecture.video.split("youtu.be/")[1]?.split("?")[0]}`
                            : demoLecture.video.includes("youtube.com/live/")
                            ? `https://www.youtube.com/embed/${demoLecture.video.split("youtube.com/live/")[1]?.split("?")[0]}`
                            : demoLecture.video
                        }
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        src={`${server}/${demoLecture.video}`}
                        controls
                        width="100%"
                        controlsList="nodownload"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;
