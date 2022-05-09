const { Contact } = require("../../models/contacts");
const { createError } = require("../../helpers");
const { isValidObjectId } = require("mongoose");

const getContactById = async (req, res, next) => {
  const { _id: owner } = req.user;
  try {
    const { id } = req.params;
    const isValid = isValidObjectId(id);
    if (isValid) {
      throw createError(404);
    }
    const result = await Contact({ _id: id, owner }, "-createdAt -updatedAt");
    if (!result) {
      throw createError(404, "Not found ");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};
module.exports = getContactById;
