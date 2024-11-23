import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './livescore.css';
import { io } from "socket.io-client";

const TournamentScore = () => {
  const { tournamentId } = useParams();
  const [teams, setTeams] = useState([]);
  const [connectedClients, setConnectedClients] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Initialize socket connection once on mount
  useEffect(() => {
    console.log(import.meta.env.SOCKET)
    const socket = io(import.meta.env.VITE_SOCKET);
    setConnectionStatus('connecting');

    socket.on('connect', () => {
      // console.log(`Connected with socket ID: ${socket.id}`);
      setConnectionStatus('connected');
    });

    socket.emit("roomId", tournamentId);

    socket.on('teamUpdate', (data) => {
      // console.log("Data received:", data);
      setTeams((prevTeams) => {
        // Update the team data only if something has changed
        const updatedTeams = prevTeams.map((t) => 
          t._id === data._id ? { ...t, ...data } : t
        ).sort((a, b) => b.points - a.points);

        return updatedTeams;
      });
    });

    socket.on('connectedcount', (data) => {
      setConnectedClients(data);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [tournamentId]);

  // Fetch initial team data
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
        const data = await response.json();
        setTeams(data.team.sort((a, b) => b.points - a.points));
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [tournamentId]);

  const wifiIconColor = () => {
    switch (connectionStatus) {
      case 'disconnected': return 'red';
      case 'connecting': return 'yellow';
      case 'connected': return 'green';
      default: return 'red';
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
        <i style={{ marginLeft: '20px' }}>Connected Clients: {connectedClients}</i>
      </div>

      <div className="scoreboard">
        <div className="header">
          <span>#</span>
          <span style={{ textAlign: 'left' }}>TEAM</span>
          <span>PTS</span>
          <span>ALIVE</span>
          <span>ELIMS</span>
        </div>
        <AnimatePresence>
          {teams.length === 0 ? (
            <p >No Team Found</p>  // Add a loading state
          ) : (
            teams.map((team, index) => (
              <motion.div
                key={team._id}
                className="row"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
              >
                <span>#{index + 1}</span>
                <span style={{ textAlign: 'left' }}>{team.teamName}</span>
                <span>{team.points}</span>
                <span className="player-status">
                  {team.players.map((status, idx) => (
                    <span
                      key={idx}
                      className={`player-bar ${status}`}
                      title={status.charAt(0).toUpperCase() + status.slice(1)}
                    ></span>
                  ))}
                </span>
                <span>{team.kills}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="colorexplain">
        <span><span className='alive'></span> <span>Alive</span></span>
        <span><span className='knocked'></span> <span>Knocked</span></span>
        <span><span className='eliminated'></span> <span>Eliminated</span></span>
      </div>
    </div>
  );
};

export default TournamentScore;
