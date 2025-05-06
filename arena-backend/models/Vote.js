const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  votes: [
    {
      category: String,
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
      loser: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
    },
  ],
  timeTaken: Number, // in milliseconds
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
