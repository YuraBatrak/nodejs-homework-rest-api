const express = require("express");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const { User, schemas } = require("../../models/user");
const { createError, sendMail } = require("../../helpers/");
const { auth, upload } = require("../../middlewares");

const router = express.Router();
const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
router.post("/register", async (req, res, next) => {
  console.log("ffffffffffffffffffffffffff");
  try {
    const { error } = schemas.register.validate(req.body);
    if (error) {
      throw createError(400, "Ошибка от Joi или другой библиотеки  валидации");
    }
    const { email, password } = req.body;
    const result = await User.findOne({ email });
    if (result) {
      throw createError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    await User.create({
      email,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    const mail = {
      to: email,
      subject: "Подтвердждение регистрации на сайте",
      html: `<a target="_blank" 
            href="localhost:4000/api/auth/verify/${verificationToken}">
                Нажмите для подтверждения email
            </a>`,
    };
    await sendMail(mail);
    res.status(201).json({
      user: { email },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw createError(404);
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
});
router.post("/verify", async (req, res, next) => {
  try {
    const { error } = schemas.verifyEmail.validate(req.body);
    if (error) {
      throw createError(400, "Email or password invalid");
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401);
    }
    if (user.verify) {
      throw createError(400, "Verification has already been passed");
    }
    const mail = {
      to: email,
      subject: "Подтвердждение регистрации на сайте",
      html: `<a target="_blank" 
            href="localhost:3000/api/auth/verify/${user.verificationToken}">
                Нажмите для подтверждения email
            </a>`,
    };
    await sendMail(mail);
    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
});
router.post("/login", async (req, res, next) => {
  const { SECRET_KEY } = process.env;
  try {
    const { error } = schemas.login.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw createError(401, "Email or password is wrong");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});
router.get("/current", auth, async (req, res) => {
  const { email } = req.user;
  res.json({
    email,
  });
});
router.get("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { originalname, path: tempUpload } = req.file;
      const resultUpload = path.join(avatarsDir, originalname);
      await fs.rename(tempUpload, resultUpload);
      const avatarURL = path.join("avatars", originalname);
      await User.findByIdAndUpdate(req.user._id, { avatarURL });
      res.json({
        avatarURL,
      });
    } catch (error) {
      await fs.unlink(req.file.path);
      next(error);
    }
  }
);
module.exports = router;
