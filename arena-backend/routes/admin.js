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

  const allSubmissions = await Submission.find().populate(
    "user",
    "name avatar"
  );

  // Compute average elo and sort each leaderboard
  const withAverage = allSubmissions.map((s) => ({
    ...s.toObject(),
    eloAverage: (s.eloFun + s.eloCreativity + s.eloAccessibility) / 3,
  }));

  const leaderboardAverage = [...withAverage]
    .sort((a, b) => b.eloAverage - a.eloAverage)
    .slice(0, 20);
  const leaderboardFun = [...withAverage]
    .sort((a, b) => b.eloFun - a.eloFun)
    .slice(0, 20);
  const leaderboardCreativity = [...withAverage]
    .sort((a, b) => b.eloCreativity - a.eloCreativity)
    .slice(0, 20);
  const leaderboardAccessibility = [...withAverage]
    .sort((a, b) => b.eloAccessibility - a.eloAccessibility)
    .slice(0, 20);

  const topVoters = await User.find({ votes: { $gt: 0 } })
    .select("name avatar votes")
    .sort({ votes: -1 })
    .limit(20);

  const submissionCount = await Submission.countDocuments();

  res.json({
    submissionCount,
    topVoters,
    leaderboardAverage,
    leaderboardFun,
    leaderboardCreativity,
    leaderboardAccessibility,
  });
});

module.exports = router;
