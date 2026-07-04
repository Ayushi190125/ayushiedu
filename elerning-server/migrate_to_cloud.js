import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_URI = "mongodb://127.0.0.1:27017/courses";
const CLOUD_URI = process.env.DB;

const collectionsToMigrate = [
  "courses",
  "lectures",
  "users",
  "quizzes",
  "quizattempts",
  "payments"
];

async function run() {
  if (!CLOUD_URI) {
    console.error("Cloud DB URI not found in process.env.DB. Please check your .env file!");
    return;
  }

  console.log("=== STARTING MIGRATION FROM LOCAL TO CLOUD ===");
  console.log(`Local DB: ${LOCAL_URI}`);
  console.log(`Cloud DB: ${CLOUD_URI.split("@")[1] || CLOUD_URI}`); // Hide password in logs

  // 1. Connect to Local DB
  console.log("\nConnecting to local database...");
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log("Connected to local database.");

  // 2. Connect to Cloud DB
  console.log("Connecting to cloud database (Atlas)...");
  const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
  console.log("Connected to cloud database.");

  // 3. Migrate each collection
  for (const collectionName of collectionsToMigrate) {
    console.log(`\nMigrating collection: "${collectionName}"...`);

    const localColl = localConn.db.collection(collectionName);
    const cloudColl = cloudConn.db.collection(collectionName);

    // Fetch local documents
    const documents = await localColl.find({}).toArray();
    console.log(` -> Found ${documents.length} documents in local "${collectionName}".`);

    // Clear remote documents
    console.log(` -> Clearing cloud "${collectionName}"...`);
    await cloudColl.deleteMany({});

    // Insert to remote database if there are documents
    if (documents.length > 0) {
      console.log(` -> Copying ${documents.length} documents to cloud "${collectionName}"...`);
      await cloudColl.insertMany(documents);
      console.log(` -> Successfully copied "${collectionName}".`);
    } else {
      console.log(` -> No documents to copy for "${collectionName}".`);
    }
  }

  // 4. Disconnect
  await localConn.close();
  await cloudConn.close();
  console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");
}

run().catch(err => {
  console.error("Migration failed:", err);
});
