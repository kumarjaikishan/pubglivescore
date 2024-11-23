const express = require('express');
const router = express.Router();
const Team = require('../models/team_model');
const Tournament = require('../models/tournament_model');
const { socketfunc } = require('../utils/ws');


router.get('/teamlist/:tournamentId', async (req, res) => {
    const { tournamentId } = req.params;
    try {
        const team = await Team.find({ tournament: tournamentId }).sort({ order: -1 }).populate({
            path: 'tournament',
            select: 'killpoints name pointstable' // Include only specific fields from 'tournament'
        });
        if (!team) {
            return res.status(400).json({
                message: "No team found"
            })
        }
        // console.log(team)
        const killpoints = team[0].tournament.killpoints
        return res.status(200).json({
            team, killpoints
        });
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
router.get('/deletetournament/:tournId', async (req, res) => {
    const { tournId } = req.params;

    try {
        const tournament = await Tournament.findByIdAndDelete(tournId);
        await Team.deleteMany({ tournament: tournId });
        res.status(200).json({ message: "Tournament Deleted" });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team list', error });
    }
});
router.post('/savelist', async (req, res) => {
    // console.log(req.body)
    try {
        for (let updatedTeam of req.body) {
            // Perform the update for each team by their ID
            await Team.findByIdAndUpdate(updatedTeam._id, updatedTeam);
        }

        // If all updates were successful, respond with success
        res.status(200).json({ message: 'Team list updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching team list', error });
    }
});
router.put('/updateteam/:tournamentId', async (req, res) => {
    const { tournamentId } = req.params;

    try {
        // Perform the update for each team by their ID
        await Team.findByIdAndUpdate(tournamentId, req.body);

        // If all updates were successful, respond with success
        res.status(200).json({ message: 'Team updated successfully' });
    } catch (error) {
        console.log(error)
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
        console.log(error)
        res.status(500).json({ message: 'Error creating tournament', error });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { tournamentId, teamName, points, kills, players, logo } = req.body;

        // Ensure all required fields are present
        if (!teamName || !players || players.length === 0) {
            return res.status(400).json({ message: 'Team name and at least one player are required' });
        }

        // Fetch the highest `order` value for teams in the given tournament
        const lastTeam = await Team.findOne({ tournamentId }).sort({ order: -1 }).exec();

        // Set the `order` for the new team. If no team exists, start at 1.
        const newTeamOrder = lastTeam ? lastTeam.order + 1 : 1;

        // Create a new team with the calculated `order`
        const team = new Team({
            tournament: tournamentId,
            teamName,
            points: points || 0,
            kills: kills || 0,
            players,
            logo,
            order: newTeamOrder // Assign the incremented order
        });

        // Save the team
        await team.save();

        // Respond with a success message and the new team details
        res.status(201).json({ message: 'Team registered successfully', team });
    } catch (error) {
        console.error(error);
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
        socketfunc(team.tournament.toString(), "teamUpdate", team)

        res.json({ message: 'Updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error });
    }
});
router.delete('/deleteteam/:id', async (req, res) => {
    // console.log(req.params.id)
    try {
        await Team.deleteOne({ _id: req.params.id });

        res.json({ message: 'Team Deleted successfully' });
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

        socketfunc(team.tournament.toString(), "teamUpdate", team)
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating score', error });
    }
});

module.exports = router;
