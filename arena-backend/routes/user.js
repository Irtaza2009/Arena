const express = require("express");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = req.user;
  res.json({
    name: user.name,
    avatar: user.avatar,
    hasSubmitted: user.hasSubmitted,
    slackId: user.slackId,
  });
});

const Submission = require("../models/Submission");
const Vote = require("../models/Vote");

router.post("/submit", auth, async (req, res) => {
  const { siteUrl, imageUrl, sourceUrl, hackatime, description, projectName } =
    req.body;

  const already = await Submission.findOne({ user: req.user._id });
  if (already) return res.status(400).json({ message: "Already submitted!" });

  const submission = await Submission.create({
    user: req.user._id,
    siteUrl,
    imageUrl,
    sourceUrl,
    projectName,
    description,
    hackatime,
  });

  req.user.hasSubmitted = true;
  await req.user.save();

  res.json({ message: "Submitted!" });
});

router.get("/submissions", auth, async (req, res) => {
  if (!req.user.hasSubmitted) {
    return res.status(403).json({ message: "Submit first to view!" });
  }

  // Exclude the user's own submission(s)
  const submissions = await Submission.find({ user: { $ne: req.user._id } })
    .populate("user", "name avatar")
    .select("-__v");

  res.json(submissions);
});

router.get("/user-votes", auth, async (req, res) => {
  res.json({ count: req.user.votes || 0 });
});

router.post("/vote", auth, async (req, res) => {
  const {
    funWinnerId,
    funLoserId,
    creativityWinnerId,
    creativityLoserId,
    accessibilityWinnerId,
    accessibilityLoserId,
    startTime,
  } = req.body;

  const endTime = Date.now();
  const timeTaken = endTime - startTime;

  const { calculateElo } = require("../utils/elo");
  const categories = [
    {
      winnerId: funWinnerId,
      loserId: funLoserId,
      key: "eloFun",
      name: "fun",
    },
    {
      winnerId: creativityWinnerId,
      loserId: creativityLoserId,
      key: "eloCreativity",
      name: "creativity",
    },
    {
      winnerId: accessibilityWinnerId,
      loserId: accessibilityLoserId,
      key: "eloAccessibility",
      name: "accessibility",
    },
  ];

  const voteRecords = [];

  for (const { winnerId, loserId, key, name } of categories) {
    if (!winnerId || !loserId) continue;

    const winner = await Submission.findById(winnerId);
    const loser = await Submission.findById(loserId);
    if (!winner || !loser) continue;

    const oldWinnerElo = winner[key];
    const oldLoserElo = loser[key];

    const [newWinnerElo, newLoserElo] = calculateElo(oldWinnerElo, oldLoserElo);

    winner[key] = newWinnerElo;
    loser[key] = newLoserElo;

    await winner.save();
    await loser.save();

    voteRecords.push({
      category: name,
      winner: winner._id,
      loser: loser._id,
      eloChange: {
        winner: newWinnerElo - oldWinnerElo,
        loser: newLoserElo - oldLoserElo,
      },
    });
  }

  // Save vote record
  await Vote.create({
    user: req.user._id,
    votes: voteRecords,
    timeTaken,
  });

  // Increment vote count
  req.user.votes = (req.user.votes || 0) + 1;
  await req.user.save();

  res.send("Vote recorded for all categories.");
});

module.exports = router;
