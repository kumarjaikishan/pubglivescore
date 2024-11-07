import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import './livescore.css';

const TournamentScore = () => {
  const { tournamentId } = useParams(); // Get tournamentId from URL params
  const [teams, setTeams] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectedClients, setConnectedClients] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // Track connection status
  const endpoint = 'http://localhost:5006';

  useEffect(() => {
    fetchTeams(); // Fetch teams initially

    setConnectionStatus('connecting'); // When establishing connection

    const socketIo = socketIOClient(endpoint); // Establish socket connection
    setSocket(socketIo); // Save socket connection in state

    // Join the specific tournament room
    socketIo.emit('joinTournament', tournamentId);

    socketIo.on('connect', () => {
      setConnectionStatus('connected'); // Socket is connected
    });

    socketIo.on('disconnect', () => {
      setConnectionStatus('disconnected'); // Socket is disconnected
    });

    // Listen for the real-time connected clients count
    socketIo.on('clientsCount', ({ count }) => {
      setConnectedClients(count); // Update the state with the connected clients count
    });

    // Listen for tournament-specific updates (e.g., score or status updates)
    socketIo.on('tournamentUpdate', (data) => {
      if (data.type === 'statusUpdate' || data.type === 'scoreUpdate') {
        setTeams((prevTeams) =>
          prevTeams
            .map((t) => (t._id === data.team._id ? { ...t, ...data.team } : t))
            .sort((a, b) => b.points - a.points) // Sort by points in descending order
        );
      }
    });

    // Cleanup on component unmount
    return () => {
      socketIo.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [tournamentId]);

  // Fetch teams from the server
  const fetchTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
      const data = await response.json();
      setTeams(data.team.sort((a, b) => b.points - a.points)); // Sort by points initially
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
      <div id="status">
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
          <AnimatePresence>
            {teams && teams.map((team, index) => (
              <motion.tr
                key={team._id} // Ensures row transition works when order changes
                className="animated-row"
                initial={{ opacity: 0 }} // Fade in effect
                animate={{ opacity: 1 }}    // Fade to full opacity
                exit={{ opacity: 0 }}       // Fade out when exiting
                transition={{ duration: 0.5 }}  // Animation duration
              >
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
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default TournamentScore;
