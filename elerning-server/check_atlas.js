import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const CLOUD_URI = process.env.DB;

async function run() {
  if (!CLOUD_URI) {
    console.error("No DB URI in .env");
    return;
  }
  
  console.log("Connecting to Atlas...");
  const conn = await mongoose.connect(CLOUD_URI);
  console.log("Connected.");
  
  // List collections in current connection database
  const currentDb = conn.connection.db;
  console.log("Current Database Name:", conn.connection.name);
  
  const collections = await currentDb.listCollections().toArray();
  console.log("Collections in current DB:", collections.map(c => c.name));
  
  if (collections.map(c => c.name).includes("courses")) {
    const count = await currentDb.collection("courses").countDocuments({});
    console.log("Courses document count:", count);
  }
  
  // List all databases in cluster
  const admin = new mongoose.mongo.Admin(currentDb);
  const dbs = await admin.listDatabases();
  console.log("All databases on Atlas cluster:", dbs.databases.map(d => d.name));
  
  await mongoose.disconnect();
}

run().catch(console.error);
