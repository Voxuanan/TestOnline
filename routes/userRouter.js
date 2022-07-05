const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const userMdw = require("../middleware/userMiddleware");

router.post("/user/register", userCtrl.register);
router.post("/user/login", userCtrl.login);
router.get("/user/refresh_token", userCtrl.generateAccessToken);
router.get("/user/logout", userCtrl.logout);
router.get("/user/sendEmail", userCtrl.sendEmail);
router.post("/user/updatePassword/:slug", userCtrl.updatePassword);

module.exports = router;
