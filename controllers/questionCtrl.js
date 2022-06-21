const Exams = require("../models/examModel");
const Questions = require("../models/questionModel");

const questionCtrl = {
    getQuesionsByExamId: async (req, res) => {
        //TODO: lấy ra x câu hỏi và shuffle nếu được
        try {
            const { id } = req.params;
            const exam = await Exams.findOne({ _id: id }).populate(
                "listOfQuestion",
                "-correctAnswer"
            );
            res.json({ msg: "Get question by exam id success!", exam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    getQuesionsByExamIdForAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await Exams.findOne({ _id: id }).populate("listOfQuestion");
            res.json({ msg: "Get question by exam id success!", exam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    updateQuestionById: async (req, res) => {
        try {
            const { id } = req.params;
            const { answerA, answerB, answerC, answerD, correctAnswer, question } = req.body;
            if (!answerA || !answerB || !answerC || !answerD || !correctAnswer || !question) {
                res.status(400).json({ msg: "All fields are required!" });
            }
            const updatedQuestion = await Questions.findByIdAndUpdate(
                { _id: id },
                { answerA, answerB, answerC, answerD, correctAnswer, question }
            );
            res.json({ msg: "Update question success!", updatedQuestion });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = questionCtrl;
