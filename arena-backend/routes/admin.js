const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const User = require("../models/User");
const Vote = require("../models/Vote");
const ResetLog = require("../models/ResetLog");

router.get("/leaderboard", async (req, res) => {
  try {
    // Validate admin secret
    const clientSecret = req.headers["x-admin-secret"];
    if (!clientSecret || clientSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Database-level aggregation for better performance
    const leaderboardData = await Submission.aggregate([
      {
        $addFields: {
          eloAverage: {
            $divide: [
              { $add: ["$eloFun", "$eloCreativity", "$eloAccessibility"] },
              3,
            ],
          },
        },
      },
      { $sort: { eloAverage: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          "user.name": 1,
          "user.avatar": 1,
          eloAverage: 1,
          eloFun: 1,
          eloCreativity: 1,
          eloAccessibility: 1,
        },
      },
    ]);

    // Get top voters
    const topVoters = await User.find({ votes: { $gt: 0 } })
      .sort({ votes: -1 })
      .limit(20)
      .select("name avatar votes")
      .lean();

    const submissionCount = await Submission.countDocuments();

    res.json({
      submissionCount,
      topVoters,
      leaderboards: {
        average: leaderboardData,
        fun: [...leaderboardData].sort((a, b) => b.eloFun - a.eloFun),
        creativity: [...leaderboardData].sort(
          (a, b) => b.eloCreativity - a.eloCreativity
        ),
        accessibility: [...leaderboardData].sort(
          (a, b) => b.eloAccessibility - a.eloAccessibility
        ),
      },
    });
  } catch (err) {
    console.error("Admin leaderboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset", async (req, res) => {
  const clientSecret = req.headers["x-admin-secret"];
  if (!clientSecret || clientSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    await Submission.deleteMany({});
    await Vote.deleteMany({});
    await User.updateMany({}, { hasSubmitted: false, votes: 0 });

    await ResetLog.create({
      performedBy: "admin", // hard coding this to 'admin' for now
      ip: req.ip,
      note: "Manual reset from leaderboard UI",
    });

    res.json({ message: "Reset successful" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ message: "Reset failed" });
  }
});

module.exports = router;
