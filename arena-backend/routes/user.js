const express = require("express");
const auth = require("../middleware/authMiddleware");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const VotingToken = require("../models/VotingToken");
const User = require("../models/User");

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
  const submissions = await Submission.find()
    .populate("user", "name avatar")
    .select("-__v");

  res.json(submissions);
});

router.get("/user-votes", auth, async (req, res) => {
  res.json({ count: req.user.votes || 0 });
});

router.post("/vote", auth, async (req, res) => {
  const {
    token,
    funWinnerId,
    funLoserId,
    creativityWinnerId,
    creativityLoserId,
    accessibilityWinnerId,
    accessibilityLoserId,
    startTime,
  } = req.body;

  // Enforce max 3 votes per user
  if ((req.user.votes || 0) >= 3) {
    return res
      .status(403)
      .json({ message: "You have reached your voting limit." });
  }

  // Validate voting token
  const votingToken = await VotingToken.findOne({ token, user: req.user._id });
  if (!votingToken || votingToken.expires < Date.now()) {
    return res
      .status(400)
      .json({ message: "Invalid or expired voting token." });
  }

  // Validate voted IDs match assigned pair
  const assignedIds = votingToken.pair.map((id) => id.toString());
  const votedIds = [
    funWinnerId,
    funLoserId,
    creativityWinnerId,
    creativityLoserId,
    accessibilityWinnerId,
    accessibilityLoserId,
  ]
    .map((id) => id && id.toString())
    .filter(Boolean);

  if (!votedIds.every((id) => assignedIds.includes(id))) {
    return res
      .status(400)
      .json({ message: "Vote does not match assigned pair." });
  }

  // Invalidate token after use
  await VotingToken.deleteOne({ token });

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

  const pairKey = [votingToken.pair[0].toString(), votingToken.pair[1].toString()].sort().join("_");
  if (!req.user.seenPairs) req.user.seenPairs = [];
  if (!req.user.seenPairs.includes(pairKey)) {
    req.user.seenPairs.push(pairKey);
    await req.user.save();
  }

  res.send("Vote recorded for all categories.");
});

router.get("/voting-pair", auth, async (req, res) => {
  // Get all submissions except the user's own
  const submissions = await Submission.find({ user: { $ne: req.user._id } })
    .populate("user", "name avatar")
    .select("-__v");

  if (submissions.length < 2) {
    return res.status(400).json({ message: "Not enough submissions to vote." });
  }

  // Build all possible pairs
  const allPairs = [];
  for (let i = 0; i < submissions.length; i++) {
    for (let j = i + 1; j < submissions.length; j++) {
      allPairs.push([submissions[i], submissions[j]]);
    }
  }

  // Get seen pairs from user (as sorted string keys)
  const user = await User.findById(req.user._id);
  const seenPairs = user.seenPairs || [];

  // Helper to create a unique key for a pair (sorted IDs)
  const pairKey = (a, b) =>
    [a._id.toString(), b._id.toString()].sort().join("_");

  // Filter out seen pairs
  const unseenPairs = allPairs.filter(
    ([a, b]) => !seenPairs.includes(pairKey(a, b))
  );

  if (unseenPairs.length === 0) {
    return res.status(400).json({ message: "No new pairs left to vote on!" });
  }

  // Pick a random unseen pair
  const randomPair =
    unseenPairs[Math.floor(Math.random() * unseenPairs.length)];
  const token = uuidv4();

  // Store token and assigned pair for this user (expires in 10 min)
  await VotingToken.create({
    token,
    user: req.user._id,
    pair: [randomPair[0]._id, randomPair[1]._id],
    expires: new Date(Date.now() + 10 * 60 * 1000),
  });

  res.json({ pair: randomPair, token });
});

module.exports = router;
