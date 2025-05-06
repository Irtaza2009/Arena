const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  siteUrl: String,
  imageUrl: String,
  sourceUrl: String,
  eloCreativity: { type: Number, default: 1000 },
  eloFun: { type: Number, default: 1000 },
  eloAccessibility: { type: Number, default: 1000 },
});

module.exports = mongoose.model("Submission", submissionSchema);
