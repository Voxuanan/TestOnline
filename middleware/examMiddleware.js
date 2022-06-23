const Exams = require("../models/examModel");

const examMiddleware = {
    isFinished: async (req, res, next) => {
        try {
            const { id } = req.params;
            const exam = await Exams.findById({ _id: id }).populate("listOfQuestion");
            req.exam = exam;
            const isContain = req.user.history.some(
                (item) => item.exam._id.toString() === exam._id.toString()
            );
            if (!isContain)
                return res.status(400).json({ msg: "This user has not took the exam yet!" });
            const isFinish = req.user.history.some(
                (item) => item.isSubmit == true && item.exam._id.toString() === exam._id.toString()
            );
            if (!isFinish)
                return res.status(400).json({ msg: "This user has not finished the exam yet!" });
            next();
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = examMiddleware;
