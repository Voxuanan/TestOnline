const router = require("express").Router();
const calCtrl = require("../controllers/contentAndLessionCtrl");
const userMdw = require("../middleware/userMiddleware");

router.post(
    "/contentAndLession/createContent",
    userMdw.isLogin,
    userMdw.isAdmin,
    calCtrl.createContent
);
router.put(
    "/contentAndLession/updateContent/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    calCtrl.updateContent
);
router.delete(
    "/contentAndLession/deleteContent/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    calCtrl.deleteContent
);
router.patch(
    "/contentAndLession/addLession/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    calCtrl.addLession
);
router.delete(
    "/contentAndLession/removeLession/:id",
    userMdw.isLogin,
    userMdw.isAdmin,
    calCtrl.removeLession
);
router.get("/contentAndLession/getContentsAndLessions", calCtrl.getContentsAndLessions);

module.exports = router;
