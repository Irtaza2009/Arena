function calculateElo(winner, loser, k = 32) {
  const expectedWin = 1 / (1 + Math.pow(10, (loser - winner) / 400));
  const expectedLose = 1 - expectedWin;

  const newWinner = Math.round(winner + k * (1 - expectedWin));
  const newLoser = Math.round(loser + k * (0 - expectedLose));

  return [newWinner, newLoser];
}

module.exports = { calculateElo };
