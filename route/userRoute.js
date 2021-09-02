const express = require("express");
const {
  getAllUsers,
  deleteAll,
  toNonAdmin,
  registerUser,
  login,
  toAdmin,
  getEmail,
  getUsername,
  profile,
  googleLogin,
  facebookLogin,
} = require("../controller/userController");
const router = express.Router();
const { verifyToken, verifyIsAdmin } = require("../auth");

router.get("/all", verifyToken, verifyIsAdmin, getAllUsers);
router.delete("/delete", deleteAll);
router.put("/to-non-admin/:id", toNonAdmin);

router.post("/register", registerUser); //#1 User registration
router.post("/login", login); //#2 login to authenticate
router.put("/to-admin/:id", verifyToken, verifyIsAdmin, toAdmin); //#2-3 set user to admin

//added for frontend
router.post("/email", getEmail);
router.post("/username", getUsername);
router.get("/", verifyToken, profile);
router.post("/google-login", googleLogin);
router.post("/facebook-login", facebookLogin);

module.exports = router;
