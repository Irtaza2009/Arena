const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  siteUrl: String,
  imageUrl: String,
  sourceUrl: String,
  projectName: String,
  description: String,
  eloCreativity: { type: Number, default: 1000 },
  eloFun: { type: Number, default: 1000 },
  eloAccessibility: { type: Number, default: 1000 },
  hackatime: {
    totalTime: String,
    projects: [
      {
        name: String,
        text: String, // e.g. "1h 24m"
        total_seconds: Number,
      },
    ],
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
