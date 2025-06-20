import express from "express";
import joi from "joi";
import Valuator from "../models/Valuator.js";
import OpenAI from "openai";
import aiPrompt from "../utils/utils.js";
import Valuation from "../models/Valuation.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const valuators = await Valuator.find().lean();
    for (const valuator of valuators) {
        valuator.valuations = await Valuation.find({ valuatorId: valuator._id }).countDocuments();
    }
    res.send(valuators.reverse());
});

router.post("/", async (req, res) => {
    const schema = joi.object({
        title: joi.string().required(),
        questionPaper: joi.string().required(),
        answerKey: joi.string().required(),
    });

    try {
        const data = await schema.validateAsync(req.body);
        const newValuator = new Valuator(data);
        return res.send(await newValuator.save());
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/byId", async (req, res) => {
    const schema = joi.object({ id: joi.string().required() });
    try {
        const data = await schema.validateAsync(req.body);
        const valuator = await Valuator.findById(data.id);
        return res.send(valuator);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/valuate", async (req, res) => {
    const schema = joi.object({
        valuatorId: joi.string().required(),
        answerSheet: joi.string().required(),
    });

    try {
        const data = await schema.validateAsync(req.body);
        const valuator = await Valuator.findById(data.valuatorId);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: aiPrompt },
                { role: "user", content: [
                    { type: "text", text: "Question Paper:" },
                    { type: "image_url", image_url: { url: valuator.questionPaper } }
                ]},
                { role: "user", content: [
                    { type: "text", text: "Answer Keys:" },
                    { type: "image_url", image_url: { url: valuator.answerKey } }
                ]},
                { role: "user", content: [
                    { type: "text", text: "Answer Sheet:" },
                    { type: "image_url", image_url: { url: data.answerSheet } }
                ]},
            ],
            max_tokens: 1000,
        });

        const resp = completion.choices[0].message.content;
        let respData;
        try {
            respData = resp.includes("```json") ? JSON.parse(resp.split("```json")[1].split("```")[0]) : JSON.parse(resp);
        } catch (err) {
            return res.status(500).send({ error: "Invalid GPT response", raw: resp });
        }

        const newValuation = new Valuation({
            valuatorId: data.valuatorId,
            data: respData,
            answerSheet: data.answerSheet,
        });
        await newValuation.save();
        return res.send(respData);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/valuations", async (req, res) => {
    const schema = joi.object({ valuatorId: joi.string().required() });
    try {
        const data = await schema.validateAsync(req.body);
        const valuations = await Valuation.find({ valuatorId: data.valuatorId }).lean();
        for (const valuation of valuations) {
            const val = await Valuator.findById(valuation.valuatorId);
            valuation.questionPaper = val?.questionPaper;
            valuation.answerKey = val?.answerKey;
        }
        return res.send(valuations.reverse());
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/total-marks", async (req, res) => {
    const schema = joi.object({ valuationId: joi.string().required() });
    try {
        const data = await schema.validateAsync(req.body);
        const valuation = await Valuation.findById(data.valuationId);
        const totalScore = valuation.data.answers.reduce((acc, ans) => acc + ans.score[0], 0);
        const maxScore = valuation.data.answers.reduce((acc, ans) => acc + ans.score[1], 0);
        const examName = (await Valuator.findById(valuation.valuatorId)).title;
        return res.send({ examName, totalScore: totalScore.toString(), maxScore: maxScore.toString() });
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/marksheet", async (req, res) => {
    const schema = joi.object({ valuatorId: joi.string().required() });
    try {
        const data = await schema.validateAsync(req.body);
        const valuations = await Valuation.find({ valuatorId: data.valuatorId }).lean();
        const marksheet = valuations.map(v => ({
            name: v.data.student_name,
            rollNo: v.data.roll_no,
            marks: v.data.answers.reduce((acc, ans) => acc + ans.score[0], 0),
            isChecked: true
        })).sort((a, b) => b.marks - a.marks);
        return res.send(marksheet);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/revaluate", async (req, res) => {
    const schema = joi.object({
        valuationId: joi.string().required(),
        remarks: joi.string().required().allow(""),
    });

    try {
        const data = await schema.validateAsync(req.body);
        const valuation = await Valuation.findById(data.valuationId);
        const valuator = await Valuator.findById(valuation.valuatorId);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: aiPrompt + `\n\nEXTRA REMARKS: ${data.remarks}` },
                { role: "user", content: [
                    { type: "text", text: "Question Paper:" },
                    { type: "image_url", image_url: { url: valuator.questionPaper } }
                ]},
                { role: "user", content: [
                    { type: "text", text: "Answer Keys:" },
                    { type: "image_url", image_url: { url: valuator.answerKey } }
                ]},
                { role: "user", content: [
                    { type: "text", text: "Answer Sheet:" },
                    { type: "image_url", image_url: { url: valuation.answerSheet } }
                ]},
            ],
            max_tokens: 1000,
        });

        const resp = completion.choices[0].message.content;
        let respData;
        try {
            respData = resp.includes("```json") ? JSON.parse(resp.split("```json")[1].split("```")[0]) : JSON.parse(resp);
        } catch (err) {
            return res.status(500).send({ error: "Invalid GPT response", raw: resp });
        }

        await Valuation.findByIdAndUpdate(data.valuationId, { data: respData });
        return res.send(respData);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/performance-graph", async (req, res) => {
    const schema = joi.object({ rollNo: joi.string().required() });
    try {
        const data = await schema.validateAsync(req.body);
        const valuations = await Valuation.find({ "data.roll_no": data.rollNo });
        const result = await Promise.all(valuations.map(async (v) => {
            const exam = await Valuator.findById(v.valuatorId);
            const total = v.data.answers.reduce((acc, ans) => acc + ans.score[0], 0);
            const max = v.data.answers.reduce((acc, ans) => acc + ans.score[1], 0);
            return { examName: exam.title, total, max };
        }));
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post("/gpt-insights", async (req, res) => {
    const schema = joi.object({ rollNo: joi.string().required() });
    try {
        const data = await schema.validateAsync(req.body);
        const valuations = await Valuation.find({ "data.roll_no": data.rollNo });

        if (!valuations.length) return res.status(404).send({ error: "No records found" });

        const summary = valuations.map((v, i) => {
            const total = v.data.answers.reduce((acc, ans) => acc + ans.score[0], 0);
            const max = v.data.answers.reduce((acc, ans) => acc + ans.score[1], 0);
            return `Exam ${i + 1}: ${total}/${max}`;
        }).join("\n");

        const answerBreakdown = valuations.flatMap((v) =>
            v.data.answers.map((a) => `${a.question}: ${a.score[0]}/${a.score[1]}`)
        ).join("\n");

        const prompt = `You are an academic mentor AI.\n\nStudent Roll No: ${data.rollNo}\n\nPerformance Summary:\n${summary}\n\nDetailed Answer Analysis:\n${answerBreakdown}\n\n## Progress Over Time\nProvide a short summary of progress.\n\n## Study Suggestions\nList specific weak areas or topics and give brief tips.`;

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        });

        const result = completion.choices[0].message.content;
        const progressSummary = result.split("## Study Suggestions")[0].replace("## Progress Over Time", "").trim();
        const studySuggestions = result.split("## Study Suggestions")[1]?.trim() || "No suggestions available.";

        res.send({ progressSummary, studySuggestions });
    } catch (err) {
        res.status(500).send({ error: "GPT insights failed", message: err.message });
    }
});

export default router;
