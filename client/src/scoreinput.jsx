import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './scoreinput.css';
import { io } from "socket.io-client";

const TournamentInput = () => {
  const { tournamentId } = useParams();

  const [teams, setTeams] = useState([]);
  const [killpoints, setkillpoints] = useState([]);
  const [connectedClients, setConnectedClients] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const wifiIconColor = () => {
    switch (connectionStatus) {
      case 'disconnected': return 'red';
      case 'connecting': return 'yellow';
      case 'connected': return 'green';
      default: return 'red';
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET);
    setConnectionStatus('connecting');

    socket.on('connect', () => {
      // console.log(`Connected with socket ID: ${socket.id}`);
      setConnectionStatus('connected');
    });

    socket.emit("modroomId", tournamentId);

    socket.on('teamUpdate', (data) => {
      // console.log("Data received:", data);
      setTeams((prevTeams) => {
        // Update the team data only if something has changed
        const updatedTeams = prevTeams.map((t) =>
          t._id === data._id ? { ...t, ...data } : t
        );

        return updatedTeams;
      });
    });

    socket.on('modconnectedcount', (data) => {
      setConnectedClients(data);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [tournamentId]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
        const data = await response.json();
        // console.log(data)
        setTeams(data.team); // Set the fetched teams
        setkillpoints(data.killpoints)
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [tournamentId]);

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
      })
    );

    try {
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
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}updatescore/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kills, points: kills * killpoints }),
      });

      if (!response.ok) throw new Error('Failed to update team');
      const data = await response.json();
      // console.log(data); // Log the response data from the server
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleBlur = (e, teamId) => {
    const kills = parseInt(e.target.value, 10) || 0;
    updateKills(teamId, kills);
  };

  return (
    <div className="tournament-input">
      <div id='status'>
        <i>Status: </i>
        <i
          className="fa fa-wifi"
          aria-hidden="true"
          style={{
            color: wifiIconColor(),
            fontSize: '2em',
          }}
        ></i>
        <i style={{ marginLeft: '20px' }}>Connected Clients: {connectedClients}</i>
      </div>
      <h2>PUBG Tournament Score Input</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Team </th>
            <th>Pts</th>
            <th>Kills</th>
            <th>Player Status</th>
          </tr>
        </thead>
        <tbody>
          {!teams && <tr style={{ color: 'yellow' }}><td colSpan={5}>No Team Found</td> </tr>}
          {teams && teams.map((team, index) => (
            <tr key={team._id} className="team-row">
              <td>{index + 1}</td>
              <td >{team.teamName}</td>
              <td>{team.points}</td>
              <td>
                <input
                  type="number"
                  value={team.kills}
                  onBlur={(e) => handleBlur(e, team._id)}
                  onChange={(e) => setTeams((prevTeams) =>
                    prevTeams.map((prevTeam) =>
                      prevTeam._id === team._id
                        ? { ...prevTeam, kills: parseInt(e.target.value, 10) || 0 }
                        : prevTeam
                    )
                  )}
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
