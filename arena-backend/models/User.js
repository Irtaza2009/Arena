const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  slackId: String,
  name: String,
  avatar: String,
  accessToken: String,
  hasSubmitted: { type: Boolean, default: false },
  votes: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
