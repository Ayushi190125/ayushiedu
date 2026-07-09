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
      // Step 1: Create Razorpay order on the backend
      const { data: orderData } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      // Step 2: Get Razorpay key from backend
      const { data: keyData } = await axios.get(`${server}/api/razorpay-key`);

      // Step 3: Open Razorpay checkout popup
      const options = {
        key: keyData.key,
        amount: orderData.order.amount,
        currency: "INR",
        name: "AyushiEdu",
        description: `Purchase: ${orderData.course.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          // Step 4: Verify payment on the backend
          try {
            const { data: verifyData } = await axios.post(
              `${server}/api/course/verification/${params.id}`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  token,
                },
              }
            );

            // Refresh user data and courses after successful purchase
            await fetchUser();
            await fetchCourses();
            await fetchMyCourse();

            toast.success(verifyData.message);
            navigate(`/payment-success/${verifyData.paymentId}`);
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed"
            );
          }
          setLoading(false);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#8a4baf",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
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
