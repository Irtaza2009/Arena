const mongoose = require("mongoose");

const resetLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  performedBy: String,
  ip: String,
  note: String,
});

module.exports = mongoose.model("ResetLog", resetLogSchema);
