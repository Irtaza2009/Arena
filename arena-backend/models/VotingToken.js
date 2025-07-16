const mongoose = require("mongoose");

const votingTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pair: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true }],
  expires: { type: Date, required: true },
});

module.exports = mongoose.model("VotingToken", votingTokenSchema);