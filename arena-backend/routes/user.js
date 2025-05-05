const express = require("express");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = req.user;
  res.json({
    name: user.name,
    avatar: user.avatar,
    hasSubmitted: user.hasSubmitted,
  });
});

const Submission = require("../models/Submission");

router.post("/submit", auth, async (req, res) => {
  const { siteUrl, imageUrl } = req.body;

  const already = await Submission.findOne({ user: req.user._id });
  if (already) return res.status(400).json({ message: "Already submitted!" });

  const submission = await Submission.create({
    user: req.user._id,
    siteUrl,
    imageUrl,
  });

  req.user.hasSubmitted = true;
  await req.user.save();

  res.json({ message: "Submitted!" });
});

router.get("/submissions", auth, async (req, res) => {
  if (!req.user.hasSubmitted) {
    return res.status(403).json({ message: "Submit first to view!" });
  }

  const submissions = await Submission.find()
    .populate("user", "name avatar")
    .select("-__v");

  res.json(submissions);
});

router.post("/vote", auth, async (req, res) => {
  const {
    funWinnerId,
    funLoserId,
    creativityWinnerId,
    creativityLoserId,
    accessibilityWinnerId,
    accessibilityLoserId,
  } = req.body;

  const { calculateElo } = require("../utils/elo");
  const categories = [
    { winnerId: funWinnerId, loserId: funLoserId, key: "eloFun" },
    {
      winnerId: creativityWinnerId,
      loserId: creativityLoserId,
      key: "eloCreativity",
    },
    {
      winnerId: accessibilityWinnerId,
      loserId: accessibilityLoserId,
      key: "eloAccessibility",
    },
  ];

  for (const { winnerId, loserId, key } of categories) {
    if (!winnerId || !loserId) continue;

    const winner = await Submission.findById(winnerId);
    const loser = await Submission.findById(loserId);
    if (!winner || !loser) continue;

    const [newWinnerElo, newLoserElo] = calculateElo(winner[key], loser[key]);
    winner[key] = newWinnerElo;
    loser[key] = newLoserElo;

    await winner.save();
    await loser.save();
  }

  res.send("Vote recorded for all categories.");
});

module.exports = router;
