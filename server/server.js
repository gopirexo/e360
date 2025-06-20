import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import valuatorRouter from "./routes/valuators.js";
import generateQuestionsRoute from "./routes/generateQuestions.js";

dotenv.config();
console.log("✅ OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

const app = express();

// ✅ FIXED: CORS config (no trailing slashes!)
app.use(
  cors({
    origin: [
      "https://e360-hazel.vercel.app", // ✅ NO trailing slash
      "https://cute-boar-57.accounts.dev"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

app.use(express.json());

// ✅ Routes
app.use("/valuators", valuatorRouter);
app.use("/generate-questions", generateQuestionsRoute);

app.get("/", (req, res) => {
  res.send("Valuate.ai backend working ✅");
});

// ✅ MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// ✅ Start server
const port = process.env.PORT || 8080;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
