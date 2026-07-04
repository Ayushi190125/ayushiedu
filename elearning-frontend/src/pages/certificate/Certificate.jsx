import React, { useEffect, useState, useRef } from "react";
import "./certificate.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

const Certificate = ({ user }) => {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef();

  // Try to generate / fetch the certificate
  async function loadCertificate() {
    try {
      // First fetch course details
      const courseRes = await axios.get(`${server}/api/course/${id}`);
      setCourse(courseRes.data.course);

      // Call generate endpoint
      const { data } = await axios.post(
        `${server}/api/certificate/generate`,
        { courseId: id },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setCert(data.certificate);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load certificate");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const handleDownload = () => {
    if (!certRef.current) return;
    toast.loading("Generating your certificate download...", { id: "cert-dl" });

    html2canvas(certRef.current, {
      scale: 2, // higher resolution
      useCORS: true,
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `Certificate-${course?.title || "Course"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Certificate downloaded successfully!", { id: "cert-dl" });
      })
      .catch((err) => {
        console.error("Canvas error: ", err);
        toast.error("Failed to download certificate", { id: "cert-dl" });
      });
  };

  if (loading) return <Loading />;

  if (!cert) {
    return (
      <div className="certificate-page-container">
        <div className="certificate-verification-box">
          <h3>Certificate Not Available</h3>
          <p style={{ color: "#94a3b8", margin: "15px 0" }}>
            Make sure you have watched 100% of the lectures in this course before attempting to claim your certificate.
          </p>
          <button className="common-btn" onClick={() => navigate(`/lectures/${id}`)}>
            Back to Lectures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page-container">
      <h2>Your Graduation Certificate</h2>
      <p style={{ color: "#94a3b8", maxWidth: "600px", textAlign: "center" }}>
        Congratulations on completing the course! Below is your official certificate of completion. You can download it directly or verify it using the unique ID.
      </p>

      {/* Printable Certificate Frame */}
      <div ref={certRef} id="certificate-print-area" className="certificate-frame">
        <div className="certificate-header">
          <h1>Certificate of Completion</h1>
          <p>AyushiEdu Platform Academy</p>
        </div>

        <div className="certificate-present">This is proudly presented to</div>
        <div className="certificate-student-name">{user?.name || "Student"}</div>

        <div className="certificate-text">
          for successfully completing all requirements and examinations for the video course
          <br />
          <span className="certificate-course-title">"{course?.title}"</span>
          <br />
          <span style={{ fontSize: "0.95rem", color: "#64748b", marginTop: "15px", display: "inline-block" }}>
            Issued on: {new Date(cert.issuedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="certificate-footer-signatures">
          <div>
            <div className="signature-img">Ayushi Paneliya</div>
            <div className="signature-line">Academy Director</div>
          </div>
          <div>
            <div className="signature-img">Ayushi</div>
            <div className="signature-line">Lead Instructor</div>
          </div>
        </div>

        <div className="certificate-id-badge">
          ID: {cert.certificateId}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
        <button
          className="common-btn"
          style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)" }}
          onClick={handleDownload}
        >
          📥 Download Image
        </button>
        <button
          className="common-btn"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          onClick={() => navigate(`/lectures/${id}`)}
        >
          Back to Course
        </button>
      </div>
    </div>
  );
};

export default Certificate;
