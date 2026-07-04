import TryCatch from "../middlewares/TryCatch.js";
import { User } from "../models/User.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { v4 as uuidv4 } from "uuid";

// Generate certificate when course is complete
export const generateCertificate = TryCatch(async (req, res) => {
  const { courseId } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if course is subscribed
  if (!user.subscription.includes(courseId)) {
    return res.status(400).json({ message: "You are not enrolled in this course" });
  }

  // Check if already generated
  const existingCert = user.certificates?.find(
    (c) => c.course.toString() === courseId
  );

  if (existingCert) {
    return res.status(200).json({
      message: "Certificate already generated",
      certificate: existingCert,
    });
  }

  // Verify completion: completed lectures count must equal total course lectures
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const courseProgress = user.progress?.find(
    (p) => p.course.toString() === courseId
  );

  const completedCount = courseProgress ? courseProgress.completedLectures.length : 0;

  if (completedCount < totalLectures || totalLectures === 0) {
    return res.status(400).json({
      message: `Course not completed yet. Completed ${completedCount}/${totalLectures} lectures.`,
    });
  }

  // Generate certificate
  const certificateId = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
  const newCertificate = {
    course: courseId,
    issuedAt: new Date(),
    certificateId,
  };

  if (!user.certificates) {
    user.certificates = [];
  }

  user.certificates.push(newCertificate);
  await user.save();

  res.status(201).json({
    message: "Certificate generated successfully!",
    certificate: newCertificate,
  });
});

// Fetch all certificates earned by the student
export const getMyCertificates = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).populate("certificates.course");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ certificates: user.certificates || [] });
});

// Verify a certificate publicly (by certificateId)
export const verifyCertificate = TryCatch(async (req, res) => {
  const { certificateId } = req.params;
  const user = await User.findOne({ "certificates.certificateId": certificateId })
    .populate("certificates.course")
    .select("name email certificates");

  if (!user) {
    return res.status(404).json({ message: "Certificate is invalid or does not exist." });
  }

  const certificate = user.certificates.find(
    (c) => c.certificateId === certificateId
  );

  res.status(200).json({
    verified: true,
    studentName: user.name,
    courseTitle: certificate.course.title,
    issuedAt: certificate.issuedAt,
    certificateId: certificate.certificateId,
  });
});
