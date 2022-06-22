const router = require("express").Router();
const examCtrl = require("../controllers/examCtrl");
const userMdw = require("../middleware/userMiddleware");

router.post("/exam/createExam", userMdw.isLogin, userMdw.isAdmin, examCtrl.createExam);
router.get("/exam/getPaginationExams", userMdw.isLogin, examCtrl.getPaginationExams);
router.patch("/exam/addQuestion/:id", userMdw.isLogin, userMdw.isAdmin, examCtrl.addQuestion);
router.delete(
    "/exam/removeQuestion/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    examCtrl.removeQuestion
);
router.post("/exam/submitAnswer/:id", userMdw.isLogin, examCtrl.submitAnswer);
router.get("/exam/startExam/:id", userMdw.isLogin, examCtrl.startExam);

module.exports = router;
