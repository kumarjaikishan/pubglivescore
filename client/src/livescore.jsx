import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './livescore.css';

const TournamentScore = () => {
  const { tournamentId } = useParams(); // Get tournamentId from URL params
  const [teams, setTeams] = useState([]);
  const [connectedClients, setConnectedClients] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // Track connection status
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts

  useEffect(()=>{
    fetchTeams();
  },[])
  
  useEffect(() => {
    let ws;
    const maxRetries = 5;

    // Function to connect to WebSocket server
    const connectWebSocket = () => {
      setConnectionStatus('connecting'); // Indicate the connection attempt
      ws = new WebSocket('/');

      // Handle WebSocket connection open
      ws.onopen = () => {
        setConnectionStatus('connected'); // Connection established
        setRetryCount(0); // Reset retry count on successful connection
        ws.send(JSON.stringify({ tournamentId }));
      };

      // Handle WebSocket message
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'statusUpdate' || data.type === 'scoreUpdate') {
            // Update teams and sort them by points
            setTeams((prevTeams) =>
              prevTeams
                .map((t) => (t._id === data.team._id ? { ...t, ...data.team } : t))
                .sort((a, b) => b.points - a.points)
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
        if (retryCount < maxRetries) {
          // Retry connection with an increasing delay
          const delay = Math.min(1000 * 2 ** retryCount, 30000); // Cap delay at 30 seconds
          setTimeout(() => {
            console.log(`Retry ${retryCount} Delayed by:`,delay )
            setRetryCount((prevRetryCount) => prevRetryCount + 1);
            connectWebSocket();
          }, delay);
        } else {
          console.log('Max retries reached. WebSocket connection not established.');
        }
      };

      // Handle WebSocket connection errors
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    // Initial WebSocket connection
    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (ws) ws.close();
    };
  }, [tournamentId, retryCount]);

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
      {/* <h2>Doz Playz</h2>
      <h3>Classic Tournament</h3> */}
      <table>
        <thead>
          <tr>
            <th>#</th>
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
      <div className="colorexplain">
        <span > <span className='alive'></span> <span>Alive</span></span>
        <span > <span className='knocked'></span> <span>Knocked</span></span>
        <span > <span className='eliminated'></span> <span>Eliminated</span></span>
       
      </div>
    </div>
  );
};

export default TournamentScore;
