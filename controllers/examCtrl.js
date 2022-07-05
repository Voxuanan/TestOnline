const Exams = require("../models/examModel");
const Questions = require("../models/questionModel");
var moment = require("moment");

const examCtrl = {
    createExam: async (req, res) => {
        try {
            let { name, grade = 12, subject, listOfQuestion, time, isTHPTQG = false } = req.body;
            if (!name || !subject || !listOfQuestion)
                return res.status(400).json({ msg: "Please fill all the required fields!" });
            if (isTHPTQG) grade = 12;
            const newExam = new Exams({ name, grade, subject, time, isTHPTQG, count: 0 });
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
            return res.json({ name, grade, subject, listOfQuestion });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    getPaginationExams: async (req, res) => {
        try {
            const {
                page = 0,
                pageSize = 20,
                grade = 12,
                subject = "Toán",
                isTHPTQG = false,
            } = req.query;
            const listOfExam = await Exams.find({ grade, subject, isTHPTQG })
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
                return res.status(400).json({ msg: "Exam Id is incorrect!" });
            }
            const { answerA, answerB, answerC, answerD, correctAnswer, question, lession } =
                req.body;
            if (!answerA || !answerB || !answerC || !answerD || !correctAnswer || !question) {
                return res.status(400).json({ msg: "All fields are required!" });
            }
            const newQuestion = new Questions({
                answerA,
                answerB,
                answerC,
                answerD,
                correctAnswer,
                question,
                lession,
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
            if (!exam) return res.status(400).json({ msg: "Exam is not exist" });
            const startTime = req.user.history.find(
                (item) => item.exam._id.toString() === exam._id.toString()
            ).startTime;
            // thời gian có thể submit bằng router được (cho thêm 2 phút sai số )
            const dateAllowed = moment(startTime)
                .add(exam.time + 2, "m")
                .toDate();
            if (!moment(Date.now()).isBefore(dateAllowed))
                return res.status(400).json({ msg: "The time is up!" });

            const item = req.user.history.find(
                (item) => item.isSubmit == false && item.exam._id.toString() == exam._id.toString()
            );
            if (item.isSubmit) return res.json({ msg: "You cant submit the exam twice" });
            let rightAnswers = 0;
            exam.listOfQuestion.forEach((answer, index) => {
                const foundAnswer = answers.find((item) => answer._id == item.questionId);
                if (answer.correctAnswer === foundAnswer?.answer) {
                    rightAnswers++;
                }
            });

            let score = Math.round((rightAnswers / exam.listOfQuestion.length) * 10 * 100) / 100;
            if (exam.listOfQuestion.length == 0) score = 10;

            if (item) {
                item.score = score;
                item.isSubmit = true;
                item.answers = answers;
                req.user.save();
            } else {
                return res.json({ msg: "This user has not started this exam!" });
            }
            res.json({ msg: "Submit success!", score });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    startExam: async (req, res) => {
        try {
            const { id } = req.params;
            let exam = await Exams.findById({ _id: id }).populate("listOfQuestion");
            if (!exam) return res.status(400).json({ msg: "Exam is not exist" });
            const isContain = req.user.history.some(
                (item) => item.exam?._id.toString() == exam._id.toString()
            );
            if (isContain) return res.json({ msg: "This user already took this exam!" });

            const historyItem = {
                exam: exam._id,
                startTime: Date.now(),
                score: 0,
                isSubmit: false,
                answers: [],
            };
            req.user.history.push(historyItem);
            req.user.save();
            exam = await Exams.findByIdAndUpdate(
                { _id: id },
                { $inc: { count: 1 } },
                { new: true }
            );
            res.json({ msg: "Start exam!", exam });
            // tự động submit (cho thêm 3 phút sai số , điểm bằng 0)
            setTimeout(() => {
                const item = req.user.history.find(
                    (item) =>
                        item.isSubmit == false && item.exam._id.toString() == exam._id.toString()
                );
                if (item) {
                    item.score = 0;
                    item.isSubmit = true;
                    item.answers = [];
                    req.user.save();
                } else {
                    return res.json({ msg: "This user has not started this exam!" });
                }
            }, (exam.time + 3) * 60 * 1000);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    updateExam: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, grade, subject, time } = req.body;
            const updateExam = await Exams.findByIdAndUpdate(
                { _id: id },
                { name, grade, subject, time },
                { new: true }
            ).populate("listOfQuestion");
            res.json({ msg: "Update exam!", updateExam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    deleteExam: async (req, res) => {
        try {
            const { id } = req.params;
            const removeExam = await Exams.findByIdAndRemove(id);
            res.json({ msg: "Delete exam!", removeExam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    historyDetailedExam: async (req, res) => {
        try {
            let historyDetail = req.user.history.find(
                (item) => item.isSubmit == true && item.exam._id.toString(),
                req.exam._id.toString()
            );
            let questionAndAnswers = historyDetail.exam.listOfQuestion.reduce((total, item) => {
                const answer = historyDetail.answers.find(
                    (itemAnswer) => itemAnswer.questionId.toString() == item._id.toString()
                );
                let questionAndAnswer = { ...item._doc, userAnswer: answer.answer };

                return [...total, questionAndAnswer];
            }, []);
            res.json({
                questionAndAnswers,
                startTime: historyDetail.startTime,
                score: historyDetail.score,
                isSubmit: historyDetail.isSubmit,
                exam: {
                    name: historyDetail.exam.name,
                    grade: historyDetail.exam.grade,
                    subject: historyDetail.exam.subject,
                    time: historyDetail.exam.time,
                    isTHPTQG: historyDetail.exam.isTHPTQG,
                    count: historyDetail.exam.count,
                    createdAt: historyDetail.exam.createdAt,
                    updateAt: historyDetail.exam.updateAt,
                },
            });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    popularExam: async (req, res) => {
        try {
            const exam = await Exams.find().sort({ count: -1 }).limit(10);
            return res.json({ msg: "Popular exam!", exam });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = examCtrl;
