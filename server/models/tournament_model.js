const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  tournName: { type: String, required: true },
  killpoints: { type: Number, default: 0 },
  logo: { type: String, default: '' }, // URL for team logo
});

module.exports = mongoose.model('tournament', tournamentSchema);
