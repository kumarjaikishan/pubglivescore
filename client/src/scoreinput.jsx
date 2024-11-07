import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './scoreinput.css';

const TournamentInput = () => {
  const { tournamentId } = useParams(); 
  
  const [teams, setTeams] = useState([]);
  const killpoints = teams[0]?.tournament?.killpoints || 0;

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
        const data = await response.json();
        // console.log(data)
        setTeams(data.team); // Set the fetched teams
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const updatePlayerStatus = async (teamId, playerIndex, status) => {
    let latestStatus;
    await setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team._id === teamId) {
          const newPlayers = [...team.players];
          newPlayers[playerIndex] = status;
          latestStatus = { newPlayers };
          return { ...team, players: newPlayers };
        }
        return team;
      }));

    try {
      // const updatedTeam = teams.find((team) => team._id === teamId);
      fetch(`${import.meta.env.VITE_API_ADDRESS}updatestatus/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: latestStatus.newPlayers }),
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update team');
          return response.json();
        })
        .then(data => {
          console.log(data); // Log the response data from the server
        })
        .catch(error => {
          console.error('Error updating team:', error);
        });
    } catch (error) {
      console.error('Error sending player status:', error);
    }
  };

  const updateKills = async (teamId, kills) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team._id === teamId ? { ...team, kills, points: kills * killpoints } : team
      )
    );
    try {
      // Send the updated kills and points to the server
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}updatescore/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kills, points: kills * killpoints }),
      });

      if (!response.ok) throw new Error('Failed to update team');
      const data = await response.json();
      console.log(data); // Log the response data from the server
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  return (
    <div className="tournament-input">
      <h1>PUBG Tournament Score Input</h1>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Team Name</th>
            <th>Points</th>
            <th>Kills</th>
            <th>Player Status</th>
          </tr>
        </thead>
        <tbody>
          {teams && teams.map((team, index) => (
            <tr key={team._id} className="team-row">
              <td>{index + 1}</td>
              <td >{team.teamName}</td>
              <td>{team.points}</td>
              <td>
                <input
                  type="number"
                  value={team.kills}
                  onChange={(e) => updateKills(team._id, parseInt(e.target.value, 10) || 0)}
                  min="0"
                />
              </td>
              <td>
                <div className="player-status">
                  {team.players.map((status, idx) => (
                    <select
                      key={idx}
                      value={status}
                      onChange={(e) => updatePlayerStatus(team._id, idx, e.target.value)}
                    >
                      <option value="alive">Alive</option>
                      <option value="knocked">Knocked</option>
                      <option value="eliminated">Eliminated</option>
                    </select>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentInput;
