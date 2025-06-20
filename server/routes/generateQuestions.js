// At the top
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate-questions", async (req, res) => {
  try {
    const { answerText } = req.body;

    const prompt = `Based on the following answer, generate 3 related exam questions:\n\n${answerText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const questions = response.choices[0].message.content;

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions." });
  }
});

export default router;
