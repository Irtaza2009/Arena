const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const User = require("../models/User");

router.get("/leaderboard", async (req, res) => {
  const clientSecret = req.headers["x-admin-secret"];
  const serverSecret = process.env.ADMIN_SECRET;

  if (!clientSecret || clientSecret !== serverSecret) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const topSubmissions = await Submission.find()
    .populate("user", "name avatar")
    .sort({ eloFun: -1 }) // You can add a query param for other categories
    .limit(20);

  const topVoters = await User.find({ votes: { $gt: 0 } })
    .select("name avatar votes")
    .sort({ votes: -1 })
    .limit(20);

  const submissionCount = await Submission.countDocuments();

  res.json({
    submissionCount,
    topSubmissions,
    topVoters,
  });
});

module.exports = router;
