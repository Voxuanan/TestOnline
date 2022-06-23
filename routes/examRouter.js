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
router.post("/exam/updateExam/:id", userMdw.isLogin, userMdw.isAdmin, examCtrl.updateExam);
router.delete("/exam/deleteExam/:id", userMdw.isLogin, userMdw.isAdmin, examCtrl.deleteExam);

module.exports = router;