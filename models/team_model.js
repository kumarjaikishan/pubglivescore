const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tournament', // Reference to the Tournament model
    required: true
  },
  teamName: { type: String, required: true },
  points: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  order: { type: Number },
  players: {
    type: [String],
    enum: ['alive', 'knocked', 'eliminated'],
    default: ['alive', 'alive', 'alive', 'alive'], // Default to a 4-player team, all 'alive'
  },
  logo: { type: String, default: '' }, // URL for team logo
});

module.exports = mongoose.model('team', teamSchema);
