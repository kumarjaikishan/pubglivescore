const express = require('express');
const router = express.Router();
const Team = require('../models/team_model');
const Tournament = require('../models/tournament_model');
const { broadcastUpdate } = require('../utils/ws');
const WebSocket = require('ws');


router.get('/teamlist/:tournamentId', async (req, res) => {
    const { tournamentId } = req.params;
    try {
        const team = await Team.find({ tournament: tournamentId }).populate({
            path: 'tournament',
            select: 'killpoints name pointstable' // Include only specific fields from 'tournament'
        });
        res.status(200).json({ team });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team list', error });
    }
});
router.get('/tournalist', async (req, res) => {
    const { tournamentId } = req.params;
    try {
        const tournament = await Tournament.find();
        res.status(200).json({ tournament });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team list', error });
    }
});

router.post('/addtournament', async (req, res) => {
    try {
        const { tournamentName, killpoints } = req.body;

        // Ensure all required fields are present
        if (!tournamentName || !killpoints) {
            return res.status(400).json({ message: "can't be empty" });
        }

        const tourn = new Tournament({
            tournName: tournamentName,
            killpoints: killpoints || 0,
        });

        await tourn.save();
        res.status(201).json({ message: 'Tournament created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating tournament', error });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { tournament, teamName, points, kills, players, logo } = req.body;

        // Ensure all required fields are present
        if (!teamName || !players || players.length === 0) {
            return res.status(400).json({ message: 'Team name and at least one player are required' });
        }

        const team = new Team({
            tournament,
            teamName,
            points: points || 0,
            kills: kills || 0,
            players,
            logo
        });

        await team.save();
        res.status(201).json({ message: 'Team registered successfully', team });
    } catch (error) {
        res.status(500).json({ message: 'Error registering team', error });
    }
});

router.put('/updatestatus/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { players: req.body.players },
            { new: true }
        );

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        broadcastUpdate(team.tournament, { type: 'statusUpdate', team });

        res.json({ message: 'Updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error });
    }
});

router.put('/updatescore/:id', async (req, res) => {
    const kills = req.body.kills;
    const points = req.body.points;
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { kills, points },
            { new: true }
        );

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        broadcastUpdate(team.tournament, { type: 'scoreUpdate', team });

        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating score', error });
    }
});

module.exports = router;
