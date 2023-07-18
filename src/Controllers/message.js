const Message = require("../Models/message");

exports.submitMessage = (req, res) => {
  const { name, email, topic, msg } = req.body;
  const _msg = new Message({
    name,
    email,
    msg,
    topic,
    msg,
  });
  _msg.save((error, message) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (message) {
      return res
        .status(201)
        .json({ msg: "Query Submitted. You will Be Notified Soon." });
    }
  });
};
