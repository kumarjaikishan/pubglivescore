import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './livescore.css';

const TournamentScore = () => {
  const { tournamentId } = useParams(); // Get tournamentId from URL params
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Fetch initial team data
    

    fetchTeams();

    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:5000');

    // On WebSocket connection open, send the tournamentId
    ws.onopen = () => {
      ws.send(JSON.stringify({ tournamentId }));
    };

    ws.onmessage = (event) => {
      try {
        const { type, team } = JSON.parse(event.data);
    
        if (type === 'statusUpdate' || type === 'scoreUpdate') {
          setTeams((prevTeams) =>
            prevTeams
              .map((t) => 
                t._id === team._id ? { ...t, ...team } : t
              )
              .sort((a, b) => b.points - a.points) // Sort by points in descending order
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => {
      ws.close();
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


  return (
    <div className="tournament-score">
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
