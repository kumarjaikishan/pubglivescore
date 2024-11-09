import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './livescore.css';

const TournamentScore = () => {
  const { tournamentId } = useParams();
  const [teams, setTeams] = useState([]);
  const [connectedClients, setConnectedClients] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    fetchTeams();

    let ws;
    let pingInterval;

    const connectWebSocket = () => {
     ws= useMemo(()=> new WebSocket('https://livescore.battlefiesta.in'))
      // ws = new WebSocket('https://livescore.battlefiesta.in');
      // ws = new WebSocket('/');
      setConnectionStatus('connecting');

      ws.onopen = () => {
        setConnectionStatus('connected');
        ws.send(JSON.stringify({ tournamentId }));

        // Send a ping message every 30 seconds to keep the connection alive
        pingInterval = setInterval(() => {
          ws.send(JSON.stringify({ type: 'ping' }));
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'statusUpdate' || data.type === 'scoreUpdate') {
            setTeams((prevTeams) =>
              prevTeams
                .map((t) => (t._id === data.team._id ? { ...t, ...data.team } : t))
                .sort((a, b) => b.points - a.points)
            );
          } else if (data.type === 'clientsCount') {
            setConnectedClients(data.count);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        clearInterval(pingInterval);
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      ws.close();
      clearInterval(pingInterval);
    };
  }, [tournamentId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
      const data = await response.json();
      setTeams(data.team.sort((a, b) => b.points - a.points));
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

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
      <div className="scoreboard">
        <div className="header">
          <span>#</span>
          <span style={{ textAlign: 'left' }}>TEAM</span>
          <span>PTS</span>
          <span>ALIVE</span>
          <span>ELIMS</span>
        </div>
        <AnimatePresence>
          {teams && teams.map((team, index) => (
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
          ))}
        </AnimatePresence>

      </div>
      <div className="colorexplain">
        <span > <span className='alive'></span> <span>Alive</span></span>
        <span > <span className='knocked'></span> <span>Knocked</span></span>
        <span > <span className='eliminated'></span> <span>Eliminated</span></span>
      </div>
    </div>
  );
};

export default TournamentScore;
