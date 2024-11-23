import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TournamentScore from './livescore';
import TournamentInput from './scoreinput';
import TeamForm from './registration';
import Home from './home';
import './App.css';

function App() {

  return (
    <>
      {/* <div className="navbar">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            
            <li><Link to="/register">Register Team</Link></li>
          </ul>
        </nav>
      </div> */}
      <div className='main'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scores/:tournamentId" element={<TournamentScore />} />
          <Route path="/register/:tournamentId" element={<TeamForm />} />
          <Route path="/input/:tournamentId" element={<TournamentInput />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
