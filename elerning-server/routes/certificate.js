import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificate.js";

const router = express.Router();

router.post("/certificate/generate", isAuth, generateCertificate);
router.get("/certificate/my", isAuth, getMyCertificates);
router.get("/certificate/verify/:certificateId", verifyCertificate); // public route

export default router;
