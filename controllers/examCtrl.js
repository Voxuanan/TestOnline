const Exams = require("../models/examModel");
const Questions = require("../models/questionModel");

const examCtrl = {
    createExam: async (req, res) => {
        try {
            const { name, grade, subject, listOfQuestion, time } = req.body;
            if (!name || !grade || !subject || !listOfQuestion)
                return res.status(400).json({ msg: "Please fill all the required fields!" });
            const newExam = new Exams({ name, grade, subject, time });
            await newExam.save();
            listOfQuestion.forEach(async (question) => {
                const newQuestion = new Questions({ ...question });
                await newQuestion.save();
                const exam = await Exams.findOneAndUpdate(
                    { _id: newExam._id },
                    {
                        $push: { listOfQuestion: newQuestion._id },
                    },
                    { new: true }
                );
            });
            res.json({ name, grade, subject, listOfQuestion });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    getPaginationExams: async (req, res) => {
        try {
            const { page = 0, pageSize = 20 } = req.query;
            const listOfExam = await Exams.find()
                .limit(pageSize)
                .skip((page - 1) * pageSize);
            res.json({ msg: "List of exam", listOfExam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    addQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await Exams.findOne({ _id: id });
            if (!exam) {
                res.status(400).json({ msg: "Exam Id is incorrect!" });
            }
            const { answerA, answerB, answerC, answerD, correctAnswer, question } = req.body;
            if (!answerA || !answerB || !answerC || !answerD || !correctAnswer || !question) {
                res.status(400).json({ msg: "All fields are required!" });
            }
            const newQuestion = new Questions({
                answerA,
                answerB,
                answerC,
                answerD,
                correctAnswer,
                question,
            });
            await newQuestion.save();
            const newExam = await Exams.findOneAndUpdate(
                { _id: exam._id },
                {
                    $push: { listOfQuestion: newQuestion._id },
                },
                { new: true }
            );
            res.json({ msg: "Add question", newExam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    removeQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const { removeId } = req.body;
            const removeQuestion = await Questions.findById({ _id: removeId });
            const exam = await Exams.findOneAndUpdate(
                { _id: id },
                {
                    $pull: { listOfQuestion: removeQuestion._id },
                },
                { new: true }
            );
            res.json({ msg: "remove question success!", exam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    submitAnswer: async (req, res) => {
        try {
            const { id } = req.params;
            const { answers } = req.body;
            const exam = await Exams.findById({ _id: id }).populate("listOfQuestion");
            let rightAnswers = 0;
            exam.listOfQuestion.forEach((answer, index) => {
                if (answer.correctAnswer === answers[index].answer) {
                    rightAnswers++;
                }
            });
            const score = Math.round((rightAnswers / exam.listOfQuestion.length) * 10 * 100) / 100;

            //TODO: Khi thêm trường cho model user -> cập nhật trường đó
            res.json({ msg: "Submit success!", score });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = examCtrl;
