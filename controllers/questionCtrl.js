const Exams = require("../models/examModel");
const Questions = require("../models/questionModel");

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

const questionCtrl = {
    getQuesionsByExamId: async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await Exams.findOne({ _id: id });
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
    getQuestionBySubjectAndGrade: async (req, res) => {
        try {
            let { isShuffle = false, questionCount = 0, subject = "Toán", grade = 12 } = req.query;
            const { listOfLessions } = req.body;
            const exams = await Exams.find({ subject, grade }).populate(
                "listOfQuestion",
                "-correctAnswer"
            );
            const arrTemp = [];
            if (exams.length == 0) return res.status(400).json({ msg: "Exam id not exist" });
            exams.forEach((exam) => {
                exam.listOfQuestion.forEach((question) => {
                    let isOk = false;
                    if (listOfLessions.length == 0) {
                        isOk = true;
                    } else if (question.lession) {
                        listOfLessions.forEach((lession) => {
                            isOk = isOk || question.lession.toString() == lession;
                        });
                    }
                    if (isOk) arrTemp.push(question);
                });
            });

            if (questionCount > arrTemp.length) questionCount = arrTemp.length;
            if (questionCount < 0) questionCount = 0;
            if (isShuffle && questionCount != 0) {
                return res.json({
                    msg: "Get question by exam id success!",
                    listOfQuestion: [...shuffle(arrTemp)].slice(0, questionCount),
                });
            } else if (isShuffle && questionCount == 0) {
                return res.json({
                    msg: "Get question by exam id success!",
                    listOfQuestion: [...shuffle(arrTemp)],
                });
            } else if (questionCount != 0) {
                return res.json({
                    msg: "Get question by exam id success!",

                    listOfQuestion: arrTemp.slice(0, questionCount),
                });
            } else res.json({ msg: "Get question by exam id success!", listOfQuestion: arrTemp });
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
