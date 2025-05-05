const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  slackId: String,
  name: String,
  avatar: String,
  accessToken: String,
  hasSubmitted: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
