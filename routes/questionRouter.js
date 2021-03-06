const router = require("express").Router();
const questionCtrl = require("../controllers/questionCtrl");
const userMdw = require("../middleware/userMiddleware");

// Dùng cho học sinh (không có đáp án)
router.post("/question/getQuesionsByExamId/:id", questionCtrl.getQuesionsByExamId);
router.get(
    "/question/admin/getQuesionsByExamId/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    questionCtrl.getQuesionsByExamIdForAdmin
);
router.put(
    "/question/admin/updateQuestionById/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    questionCtrl.updateQuestionById
);
router.post(
    "/question/admin/getQuestionBySubjectAndGrade",
    questionCtrl.getQuestionBySubjectAndGrade
);

module.exports = router;
