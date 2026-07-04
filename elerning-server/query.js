import mongoose from "mongoose";
import dotenv from "dotenv";
import { Courses } from "./models/Courses.js";
import { Lecture } from "./models/Lecture.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB);
  console.log("Connected to DB:", process.env.DB);

  const courses = await Courses.find({});
  console.log("Courses found:", courses.length);
  courses.forEach(c => {
    console.log(`Course: ID=${c._id}, Title=${c.title}, CreatedBy=${c.createdBy}`);
  });

  const lectures = await Lecture.find({});
  console.log("Lectures found:", lectures.length);
  lectures.forEach(l => {
    console.log(`Lecture: ID=${l._id}, Title=${l.title}, Course=${l.course}, Video=${l.video}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
