import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState({});
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // New progress & quiz states
  const [completedLectures, setCompletedLectures] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);

  if (user && user.role !== "admin" && user.role !== "teacher" && !user.subscription.includes(params.id))
    return navigate("/");

  // Fetch course progress
  async function fetchProgress() {
    try {
      const { data } = await axios.get(`${server}/api/progress/course/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setCompletedLectures(data.completedLectures || []);
      setProgressPercentage(data.percentage || 0);
    } catch (error) {
      console.log("Error fetching progress:", error);
    }
  }

  async function markCompleted(lectureId) {
    try {
      const { data } = await axios.post(
        `${server}/api/progress/complete`,
        { courseId: params.id, lectureId },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      fetchProgress();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark completed");
    }
  }

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    fetchLectures();
    fetchProgress();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="lecture-page">
          <div className="left">
            {lecLoading ? (
              <Loading />
            ) : (
              <>
                {lecture && lecture.video ? (
                  <>
                    {lecture.video.includes("youtube.com") || lecture.video.includes("youtu.be") ? (
                      <iframe
                        width="100%"
                        height="450"
                        src={
                          lecture.video.includes("youtube.com/watch")
                            ? `https://www.youtube.com/embed/${new URLSearchParams(new URL(lecture.video).search).get("v")}`
                            : lecture.video.includes("youtu.be/")
                              ? `https://www.youtube.com/embed/${lecture.video.split("youtu.be/")[1]?.split("?")[0]}`
                              : lecture.video.includes("youtube.com/live/")
                                ? `https://www.youtube.com/embed/${lecture.video.split("youtube.com/live/")[1]?.split("?")[0]}`
                                : lecture.video
                        }
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                      ></iframe>
                    ) : (
                      <video
                        src={`${server}/${lecture.video}`}
                        width={"100%"}
                        controls
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        autoPlay
                        onEnded={() => markCompleted(lecture._id)}
                      ></video>
                    )}
                    <h1>{lecture.title}</h1>
                    <h3>{lecture.description}</h3>

                    {/* Progress Action Controls */}
                    <div className="action-buttons-container">
                      {completedLectures.includes(lecture._id) ? (
                        <div className="completed-badge">
                          ✓ Lecture Completed
                        </div>
                      ) : (
                        <button
                          className="complete-btn"
                          onClick={() => markCompleted(lecture._id)}
                        >
                          Mark as Completed
                        </button>
                      )}

                      <button
                        className="quiz-btn"
                        onClick={() => navigate(`/quiz/${params.id}`)}
                      >
                        ✍ Take Quiz
                      </button>

                      {progressPercentage === 100 && (
                        <button
                          className="cert-btn"
                          onClick={() => navigate(`/certificate/${params.id}`)}
                        >
                          🎓 Claim Certificate
                        </button>
                      )}

                      {/* AI Tutor shortcut */}
                      <button
                        className="common-btn"
                        style={{ margin: 0, background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)" }}
                        onClick={() => navigate(`/ai-tutor`, { state: { lectureId: lecture._id } })}
                      >
                        🤖 Ask AI Tutor
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p style={{ fontSize: "1.2rem", lineHeight: "1.6", color: "#94a3b8" }}>
                      📚 <strong>Welcome to this course!</strong> Select a lecture
                      from the list on the right to start watching. Complete all lectures to unlock the course quiz and claim your graduation certificate.
                    </p>

                    <h3 style={{ marginTop: "30px", borderLeft: "4px solid #a855f7", paddingLeft: "15px" }}>
                      🎥 Available Lectures:
                    </h3>
                    {lectures && lectures.length > 0 ? (
                      <div className="lecture-preview-list">
                        {lectures.map((lec, index) => (
                          <div
                            key={lec._id}
                            className="preview-card"
                            onClick={() => fetchLecture(lec._id)}
                          >
                            {lec.video && (lec.video.includes("youtube.com") || lec.video.includes("youtu.be")) ? (
                              <div style={{
                                width: "100%",
                                height: "150px",
                                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem",
                                marginBottom: "12px",
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                              }}>
                                📺
                              </div>
                            ) : (
                              <video
                                src={`${server}/${lec.video}`}
                                muted
                                loop
                              />
                            )}
                            <h4>
                              {index + 1}. {lec.title}{" "}
                              {completedLectures.includes(lec._id) && "✓"}
                            </h4>
                            <p>{lec.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No lectures uploaded yet.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="right">
            {(user && (user.role === "admin" || user.role === "teacher")) && (
              <button className="common-btn" style={{ width: "100%", marginBottom: "15px" }} onClick={() => setShow(!show)}>
                {show ? "Close Form" : "Add Lecture +"}
              </button>
            )}

            {show && (
              <div className="lecture-form" style={{ marginBottom: "20px" }}>
                <h2>Add Lecture</h2>
                <form onSubmit={submitHandler}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <label>Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />

                  <input
                    type="file"
                    onChange={changeVideoHandler}
                    required
                  />

                  {videoPrev && (
                    <video
                      src={videoPrev}
                      width="100%"
                      controls
                      style={{ borderRadius: "8px", margin: "10px 0" }}
                    ></video>
                  )}

                  <button
                    disabled={btnLoading}
                    type="submit"
                    className="common-btn"
                    style={{ width: "100%" }}
                  >
                    {btnLoading ? "Please Wait..." : "Add Lecture"}
                  </button>
                </form>
              </div>
            )}

            <h3 style={{ marginBottom: "15px" }}>Course Progress: {progressPercentage}%</h3>
            <div className="progress-bar-bg" style={{ marginBottom: "25px", height: "10px" }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            {lectures && lectures.length > 0 ? (
              lectures.map((e, i) => (
                <div key={e._id} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    onClick={() => fetchLecture(e._id)}
                    className={`lecture-number ${lecture._id === e._id ? "active" : ""
                      }`}
                  >
                    <span>
                      {i + 1}. {e.title}
                    </span>
                    {completedLectures.includes(e._id) && (
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>
                    )}
                  </div>
                  {(user && (user.role === "admin" || user.role === "teacher")) && (
                    <button
                      className="common-btn"
                      style={{ background: "red", marginTop: "-5px", marginBottom: "15px", fontSize: "14px", padding: "6px" }}
                      onClick={() => deleteHandler(e._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No lectures found.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Lecture;
