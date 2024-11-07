import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './livescore.css';

const TournamentScore = () => {
  const { tournamentId } = useParams(); // Get tournamentId from URL params
  const [teams, setTeams] = useState([]);
  const [connectedClients, setConnectedClients] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // Track connection status

  useEffect(() => {
    fetchTeams();

    // Connect to WebSocket server
    // const ws = new WebSocket('ws://localhost:5006');
    const ws = new WebSocket('ws://localhost:5006');
    // const ws = new WebSocket('wss://127.0.0.1:5006');
    // const ws = new WebSocket('https://127.0.0.1:5006');
    // const ws = new WebSocket('/ws');
    // const ws = new WebSocket('/');

    setConnectionStatus('connecting'); // When starting connection

    // Handle WebSocket connection open
    ws.onopen = () => {
      setConnectionStatus('connected'); // Connection established
      ws.send(JSON.stringify({ tournamentId }));
    };

    // Handle WebSocket message
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'statusUpdate' || data.type === 'scoreUpdate') {
          setTeams((prevTeams) =>
            prevTeams
              .map((t) => (t._id === data.team._id ? { ...t, ...data.team } : t))
              .sort((a, b) => b.points - a.points) // Sort by points in descending order
          );
        } else if (data.type === 'clientsCount') {
          setConnectedClients(data.count); // Update connected clients count
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Handle WebSocket connection close
    ws.onclose = () => {
      setConnectionStatus('disconnected'); // Connection closed
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, [tournamentId]);

  // Fetch teams from the server
  const fetchTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
      const data = await response.json();
      setTeams(data.team.sort((a, b) => b.points - a.points));
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Determine Wi-Fi icon color based on connection status
  const wifiIconColor = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return 'red';
      case 'connecting':
        return 'yellow';
      case 'connected':
        return 'green';
      default:
        return 'red';
    }
  };

  return (
    <div className="tournament-score">
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
        <p style={{ marginLeft: '20px' }}>Connected Clients: {connectedClients}</p>
      </div>
      <h1>PUBG Tournament Live Scores</h1>
      <table>
        <thead>
          <tr>
            <th>RANK</th>
            <th>TEAM</th>
            <th>PTS</th>
            <th>ALIVE</th>
            <th>ELIMS</th>
          </tr>
        </thead>
        <tbody>
          {teams && teams.map((team, index) => (
            <tr key={team._id} className="animated-row">
              <td>#{index + 1}</td>
              <td>{team.teamName}</td>
              <td>{team.points}</td>
              <td>
                <div className="player-status">
                  {team.players.map((status, idx) => (
                    <div
                      key={idx}
                      className={`player-bar ${status}`}
                      title={status.charAt(0).toUpperCase() + status.slice(1)}
                    ></div>
                  ))}
                </div>
              </td>
              <td>{team.kills}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentScore;
