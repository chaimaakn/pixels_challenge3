const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    board: [[String]],
    turn: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
});

module.exports = mongoose.model('Game', gameSchema);