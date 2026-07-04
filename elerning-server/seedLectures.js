import mongoose from "mongoose";
import dotenv from "dotenv";
import { Courses } from "./models/Courses.js";
import { Lecture } from "./models/Lecture.js";
import { User } from "./models/User.js";

dotenv.config();

// Custom distinct lectures for each course title (5 per course)
const courseLecturesMap = {
  "Cloud Computing": [
    {
      title: "Introduction to Cloud Computing",
      description: "Learn what the cloud is, cloud models (IaaS, PaaS, SaaS), and public vs private clouds.",
      video: "https://youtu.be/RwtE88yXE8s?si=O5ynq2HPNtROT4BA"
    },
    {
      title: "Cloud Services & virtualization",
      description: "Understand virtualization technology, hypervisors, and core cloud architecture components.",
      video: "https://www.youtube.com/live/q3m1AB9ECXo?si=Zg0NrzQPudE5Tat-"
    },
    {
      title: "Amazon Web Services (AWS) Overview",
      description: "A hands-on introduction to AWS EC2, S3, RDS and cloud infrastructure setups.",
      video: "https://www.youtube.com/live/Xntde7S07Ps?si=rrMbMATWH4bKJ7Nq"
    },
    {
      title: "Cloud Security & Governance",
      description: "Explore security threats, IAM policies, access control methods, and shared responsibility frameworks.",
      video: "https://youtu.be/2LaAJq1lB1Q?si=7Z702QdpznB5rdXV"
    },
    {
      title: "Serverless Architecture (AWS Lambda)",
      description: "Learn serverless principles, microservices scaling, event-driven functions, and billing details.",
      video: "https://youtu.be/E-bNlmja0j8?si=tyvhK-n5J9zK1akt"
    }
  ],
  "Web Development": [
    {
      title: "Modern Web Development Guide",
      description: "An overview of how the web works, front-end vs back-end development, and databases.",
      video: "https://youtu.be/NkwFxeHARqc?si=tr6YQBTU6KEzVYB7"
    },
    {
      title: "HTML & CSS Core Concepts",
      description: "Learn CSS flexbox, grid systems, page structuring, and responsive media query techniques.",
      video: "https://youtu.be/6mbwJ2xhgzM?si=M5E7lReubNne1kvI"
    },
    {
      title: "JavaScript Syntax & Event Loops",
      description: "Understand JavaScript fundamentals, event listeners, callbacks, promises, and async-await.",
      video: "https://youtu.be/HcOc7P5BMi4?si=DCNug5ytzfZpqQa4"
    },
    {
      title: "React.js Frontend Framework Crash Course",
      description: "Learn React virtual DOMs, functional components, state hooks, properties, and page rendering.",
      video: "https://www.youtube.com/watch?v=SqcY0GlETPk"
    },
    {
      title: "REST APIs with Node & Express",
      description: "Build a custom backend web server, handle query routing, middleware systems, and database lookups.",
      video: "https://youtu.be/7fjOw8ApZ1I?si=6eC8PRId31aqEDKN"
    }
  ],
  "Web Designing": [
    {
      title: "UI/UX Design Fundamentals",
      description: "Learn core visual design guidelines, typography, spacing, colors, and user personas.",
      video: "https://youtu.be/01g74DjrOl8?si=p1w0BamWOf7KUFYg"
    },
    {
      title: "Figma UI Designing Tutorial",
      description: "An absolute beginner's hands-on guide to using Figma grids, frames, and components.",
      video: "https://youtu.be/uQsyobT2Rv8?si=LLqgRsq-8lPdMWrz"
    },
    {
      title: "Responsive Layouts & Mockups",
      description: "Learn to build responsive grid designs and high-fidelity prototypes for mobile and desktop screens.",
      video: "https://youtu.be/5WAXWoX7tp8?si=GaxqhQfJkS9b92tL"
    },
    {
      title: "Mobile App Designing Principles",
      description: "Learn design guidelines specific to iOS and Android applications, tab bars, and gestures.",
      video: "https://youtu.be/3Soz71yK8Us?si=yYo-ViOKNA3AWtYf"
    },
    {
      title: "Graphic Vectors and Color Theory",
      description: "A complete masterclass on choosing color palettes, gradients, shadows, and custom vector icons.",
      video: "https://youtu.be/h9r_UpOzajA?si=jxQ0CK-yOoEbfPyG"
    }
  ],
  "Blockchain Technology": [
    {
      title: "How Blockchain Works",
      description: "An in-depth explanation of hash functions, distributed ledgers, nodes, and cryptography blocks.",
      video: "https://youtu.be/YJyXfjbBmc8?si=5ieOWQ9336dFFBcQ"
    },
    {
      title: "Introduction to Smart Contracts",
      description: "Learn to write and deploy smart contracts on Ethereum using the Solidity language.",
      video: "https://youtu.be/-2RJz-_8lbo?si=7ECzusk8OUVfAbUm"
    },
    {
      title: "Building dApps (Decentralized Apps)",
      description: "Connect MetaMask wallet to React frontends using ethers.js to build decentralized portals.",
      video: "https://youtu.be/Tl_Pueia_gY?si=EZByWVi4HFhZPGMe"
    },
    {
      title: "Cryptography Hash Functions",
      description: "Learn SHA-256 algorithms, asymmetric encryption, Merkle Trees, and transaction validation keys.",
      video: "https://youtu.be/gTfNtop9vzM?si=gvc-jS8X5Q-kvqlO"
    },
    {
      title: "Ethereum Virtual Machine (EVM) Architecture",
      description: "Understand bytecodes, smart contract gas cost optimizations, memory allocation, and storage registers.",
      video: "https://youtu.be/sTOcqS4msoU?si=ArT36ABhrreRWS9J"
    }
  ],
  "Artificial Intelligence": [
    {
      title: "Introduction to Machine Learning",
      description: "Learn regression models, supervised vs unsupervised learning, and core math structures.",
      video: "https://youtu.be/ukzFI9rgwfU?si=mgkURui1Olu3ffwR"
    },
    {
      title: "Deep Learning & Neural Networks",
      description: "Understand weights, biases, layers, activation functions, and gradient descent algorithms.",
      video: "https://youtu.be/CS4cs9xVecg?si=8KDxYED4wL4gHZG-"
    },
    {
      title: "Generative AI & LLMs Explained",
      description: "Understand transformers, attention mechanisms, tokenizers, and API prompt engineers.",
      video: "https://youtu.be/eTPiL3DF27U?si=Ui07s3REgC6Z2VsR"
    },
    {
      title: "Natural Language Processing (NLP)",
      description: "Learn text processing, tokenization, POS tagging, word embeddings, and syntax architectures.",
      video: "https://youtu.be/-33oXx0TwHI?si=Y2gWxChiYItutsDV"
    },
    {
      title: "Reinforcement Learning & AI Agents",
      description: "Explore policy networks, rewards systems, Q-learning algorithms, and autonomous agents.",
      video: "https://youtu.be/4dwsSz_fNSQ?si=3jx-1LE8FopAR-bl"
    }
  ]
};

async function run() {
  await mongoose.connect(process.env.DB);
  console.log("Connected to DB to seed 5 custom course-specific lectures...");

  // 1. Clear old lectures
  await Lecture.deleteMany({});
  console.log("Deleted old lectures.");

  // 2. Fetch all courses
  const courses = await Courses.find({});
  if (courses.length === 0) {
    console.log("No courses found. Please create courses first.");
    await mongoose.disconnect();
    return;
  }

  // 3. Create lectures for each course dynamically
  for (const course of courses) {
    console.log(`Seeding 5 lectures for course: ${course.title}`);

    // Find lectures mapped to this title, fall back to Web Development if not found
    const customLectures = courseLecturesMap[course.title] || courseLecturesMap["Web Development"];

    const lecturesData = customLectures.map(lec => ({
      title: lec.title,
      description: lec.description,
      video: lec.video,
      course: course._id
    }));

    await Lecture.create(lecturesData);
  }
  console.log("5 Custom distinct lectures successfully seeded per course!");

  // 4. Automatically subscribe all users to all courses for testing
  const users = await User.find({});
  console.log(`Subscribing ${users.length} users to all courses...`);

  const courseIds = courses.map(c => c._id);
  for (const user of users) {
    user.subscription = courseIds;
    // Reset progress to test completing lectures
    user.progress = [];
    await user.save();
    console.log(`Updated user subscription for: ${user.name}`);
  }

  await mongoose.disconnect();
  console.log("Seeding complete. Disconnected.");
}

run().catch(console.error);
