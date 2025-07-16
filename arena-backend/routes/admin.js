const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const User = require("../models/User");
const Vote = require("../models/Vote");
const ResetLog = require("../models/ResetLog");
const auth = require("../middleware/authMiddleware");

router.get("/leaderboard", async (req, res) => {
  try {
    // Validate admin secret
    const clientSecret = req.headers["x-admin-secret"];
    if (!clientSecret || clientSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get all submissions with user info
    const submissions = await Submission.find({})
      .populate("user", "name avatar")
      .lean();

    // Get all votes
    const votes = await Vote.find({}).lean();

    // Build stats for each submission
    const statsMap = {};
    submissions.forEach((sub) => {
      statsMap[sub._id.toString()] = {
        submission: sub,
        showdowns: 0,
        fun: { won: 0, lost: 0 },
        creativity: { won: 0, lost: 0 },
        accessibility: { won: 0, lost: 0 },
      };
    });

    // Track which votes each submission has already been counted for (for showdowns)
    const showdownTracker = {};

    votes.forEach((vote) => {
      // For this vote, collect all unique submission IDs that appeared in any category
      const pairSet = new Set();
      vote.votes.forEach(({ winner, loser }) => {
        if (winner) pairSet.add(winner.toString());
        if (loser) pairSet.add(loser.toString());
      });

      // For each submission in this pair, increment showdowns ONCE per vote
      pairSet.forEach((subId) => {
        if (statsMap[subId]) {
          // Only increment if this vote hasn't already been counted for this submission
          showdownTracker[subId] = showdownTracker[subId] || new Set();
          if (!showdownTracker[subId].has(vote._id.toString())) {
            statsMap[subId].showdowns++;
            showdownTracker[subId].add(vote._id.toString());
          }
        }
      });

      // Count wins/losses per category
      vote.votes.forEach(({ category, winner, loser }) => {
        if (winner && statsMap[winner.toString()]) {
          statsMap[winner.toString()][category].won++;
        }
        if (loser && statsMap[loser.toString()]) {
          statsMap[loser.toString()][category].lost++;
        }
      });
    });

    // Convert to array and sort by showdowns
    const votingStats = Object.values(statsMap).sort(
      (a, b) => b.showdowns - a.showdowns
    );

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
      votingStats,
    });
  } catch (err) {
    console.error("Admin leaderboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset", auth, async (req, res) => {
  const clientSecret = req.headers["x-admin-secret"];
  if (!clientSecret || clientSecret !== process.env.ADMIN_SECRET_RESET) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    await Submission.deleteMany({});
    await Vote.deleteMany({});
    await User.updateMany({}, { hasSubmitted: false, votes: 0 });

    // Reset seenPairs for all users
    await User.updateMany({}, { $set: { seenPairs: [] } });

    await ResetLog.create({
      performedBy: "admin", // hard coding this to 'admin' for now
      ip: req.ip,
      note: "Manual reset from leaderboard UI",
    });

    res.json({ message: "All data reset!" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ message: "Reset failed" });
  }
});

module.exports = router;
