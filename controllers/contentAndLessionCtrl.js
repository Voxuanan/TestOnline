const Contents = require("../models/contentModel");
const Lessions = require("../models/lessionModel");
const contentAndLessionCtrl = {
    createContent: async (req, res) => {
        try {
            const { unit, grade, subject, listOfLessions } = req.body;
            if (!unit || !grade || !subject)
                return res.status(400).json({ msg: "Please fill all the required fields!" });
            const newContent = new Contents({ grade, subject, unit });
            await newContent.save();
            listOfLessions.forEach(async (lesion) => {
                const newLesion = new Lessions({ name: lesion });
                await newLesion.save();
                const content = await Contents.findOneAndUpdate(
                    { _id: newContent._id },
                    {
                        $push: { listOfLessions: newLesion._id },
                    },
                    { new: true }
                );
            });
            res.json({ unit, grade, subject, listOfLessions });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    updateContent: async (req, res) => {
        try {
            const { id } = req.params;
            const { unit, grade, subject } = req.body;
            const content = await Contents.findByIdAndUpdate(
                { _id: id },
                { unit, grade, subject },
                { new: true }
            ).populate("listOfLessions");
            res.json({ msg: "Update content!", content });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    deleteContent: async (req, res) => {
        try {
            const { id } = req.params;
            const content = await Contents.findByIdAndRemove(id);
            res.json({ msg: "Delete content!", content });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    addLession: async (req, res) => {
        try {
            const { id } = req.params;
            const content = await Contents.findOne({ _id: id });
            if (!content) {
                return res.status(400).json({ msg: "Content Id is incorrect!" });
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ msg: "Name is required!" });
            }
            const newLesion = new Lessions({
                name,
            });
            await newLesion.save();
            const newContent = await Contents.findOneAndUpdate(
                { _id: content._id },
                {
                    $push: { listOfLessions: newLesion._id },
                },
                { new: true }
            );
            res.json({ msg: "Add lession", newContent });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    removeLession: async (req, res) => {
        try {
            const { id } = req.params;
            const { removeId } = req.body;
            const removeLession = await Lessions.findById({ _id: removeId });
            const content = await Contents.findOneAndUpdate(
                { _id: id },
                {
                    $pull: { listOfLessions: removeLession._id },
                },
                { new: true }
            );
            res.json({ msg: "remove lession success!", content });
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
    getContentsAndLessions: async (req, res) => {
        try {
            const { subject, grade } = req.query;
            const content = await Contents.find({ subject, grade }).populate("listOfLessions");
            res.json(content);
        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = contentAndLessionCtrl;
