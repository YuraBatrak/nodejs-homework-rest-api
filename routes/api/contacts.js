const express = require("express");
const ctrl = require("../../controllers");
const { auth } = require("../../middlewares");
const router = express.Router();

router.get("/", auth, ctrl.getAll);

router.get("/:contactId", ctrl.getContactById);

router.post("/", auth, ctrl.addContact);

router.delete("/:contactId", auth, ctrl.delContact);

router.put("/:contactId", auth, ctrl.updateContact);

router.patch("/:contactId/favorite", auth, ctrl.updateFavorite);

module.exports = router;
