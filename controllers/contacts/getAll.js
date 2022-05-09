const { Contact } = require("../../models/contacts");

const getAll = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const result = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt"
    ).populate("owner");
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports = getAll;
