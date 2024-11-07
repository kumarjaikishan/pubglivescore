import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TournamentScore from './livescore';
import TournamentInput from './scoreinput';
import TeamForm from './registration';
import Home from './home';
import './App.css';

function App() {
 
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/672b437cf228f39733c4b7b7`);
        const data = await response.json();
        // console.log(data)
        setTeams(data.team); // Set the fetched teams
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);
  


  return (
    <>
      <div className="navbar">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            
            <li><Link to="/register">Register Team</Link></li>
          </ul>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/scores/:tournamentId" element={<TournamentScore />} />
        <Route path="/register" element={<TeamForm />} />
        <Route path="/input/:tournamentId" element={<TournamentInput teams={teams} setTeams={setTeams} />} />
      </Routes>
    </>
  );
}

export default App;
