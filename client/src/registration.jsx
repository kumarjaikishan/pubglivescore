import { useState, useEffect } from 'react';

const TeamForm = () => {
  // Default state for creating or editing a team
  const [tournamentName, settournamentName] = useState('');
  const [killpoints, setkillpoints] = useState(0);
  const [tournalist, settournalist] = useState([]);
  const [tournament, settournament] = useState('672b437cf228f39733c4b7b7')
  const [teamName, setTeamName] = useState('');
  const [points, setPoints] = useState(0);
  const [kills, setKills] = useState(0);
  const [players, setPlayers] = useState(['alive', 'alive', 'alive', 'alive']); // Array of player statuses
  const [logoPreview, setLogoPreview] = useState('');
  const [teamList, setTeamList] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null); // Track the team being edited

  // Fetch registered teams on component mount
  useEffect(() => {
    fetchTournament();
  }, []);
 
  useEffect(() => {
    fetchTournamentone();
  }, [tournament]);
  const fetchTournament = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}tournalist`);
      const data = await response.json();
      console.log(data)
      settournalist(data.tournament); // Set the fetched teams
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  const fetchTournamentone = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournament}`);
      const data = await response.json();
      console.log(data)
      setTeamList(data.team); // Set the fetched teams
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  // Handle input changes
  const handleInputChange = (setter) => (event) => setter(event.target.value);

  // Handle players array changes (update status)
  const handlePlayerStatusChange = (index, status) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = status; // Update the status for the player
    setPlayers(updatedPlayers);
  };

  // Add a new player (add a new 'alive' status to the array)
  const addPlayer = () => {
    setPlayers([...players, 'alive']);
  };

  // Remove a player (remove the status from the array)
  const removePlayer = (index) => {
    const updatedPlayers = players.filter((_, idx) => idx !== index);
    setPlayers(updatedPlayers);
  };

  // Handle file input for the team logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission (submit the team data)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { tournament, teamName, points, kills, players, logo: logoPreview };

    try {
      let response;
      if (editingTeam) {
        // Update existing team
        response = await fetch(`${import.meta.env.VITE_API_ADDRESS}update/${editingTeam._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Register new team
        response = await fetch(`${import.meta.env.VITE_API_ADDRESS}register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const newOrUpdatedTeam = await response.json();
        if (editingTeam) {
          setTeamList((prevList) =>
            prevList.map((team) => (team._id === editingTeam._id ? newOrUpdatedTeam : team))
          );
        } else {
          setTeamList((prevList) => [...prevList, newOrUpdatedTeam]); // Add new team to the list
        }
        resetForm(); // Reset the form
        setEditingTeam(null); // Clear the editing state
      } else {
        console.error('Failed to submit team data');
      }
    } catch (error) {
      console.error('Error submitting team data:', error);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setTeamName('');
    setPoints(0);
    setKills(0);
    setPlayers(['alive', 'alive', 'alive', 'alive']); // Reset players to default
    setLogoPreview('');
  };

  // Handle team deletion
  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}delete/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeamList((prevList) => prevList.filter((team) => team._id !== teamId));
        alert('Team deleted successfully');
      } else {
        console.error('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };
  const addtournament = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}addtournament`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentName, killpoints })
      });

      if (response.ok) {
        alert('Team created successfully');
      } else {
        console.error('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  // Handle team editing
  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamName(team.teamName);
    setPoints(team.points);
    setKills(team.kills);
    setPlayers(team.players); // Pre-populate players (now an array of statuses)
    setLogoPreview(team.logo); // Pre-populate the logo
  };

  return (
    <div className='register'>

      <label>
        Tournament Name
        <input
          type="text"
          value={tournamentName}
          onChange={handleInputChange(settournamentName)}
          required
        />
      </label>
      <label>
        Kill Points
        <input
          type="number"
          value={killpoints}
          onChange={handleInputChange(setkillpoints)}
          required
        />
      </label>
      <button onClick={addtournament}>Create</button>

      <div>
        <select
          // value={status}
          onChange={(e) => settournament(e.target.value)}
        >
          {tournalist && tournalist.map((tourna, idx) => (
                      <option value={tourna._id} key={idx}>{tourna.tournName}</option>
             ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>{editingTeam ? 'Edit Team' : 'Register Team'}</h2>

        <label>
          Team Name
          <input
            type="text"
            value={teamName}
            onChange={handleInputChange(setTeamName)}
            required
          />
        </label>

        <label>
          Points
          <input
            type="number"
            value={points}
            onChange={handleInputChange(setPoints)}
            required
          />
        </label>

        <label>
          Kills
          <input
            type="number"
            value={kills}
            onChange={handleInputChange(setKills)}
            required
          />
        </label>

        <div>
          <h3>Team Logo</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {logoPreview && <img src={logoPreview} alt="Team Logo" style={{ width: '100px', marginTop: '10px' }} />}
        </div>

        <button type="submit">{editingTeam ? 'Update Team' : 'Register Team'}</button>
      </form>

      <div>
        <h3>Registered Teams</h3>
        <div>
          {teamList && teamList.map((team) => (
            <div key={team._id}>
              <strong>{team.teamName}</strong> - Points: {team.points}, Kills: {team.kills}
              <button onClick={() => handleEditTeam(team)}>Edit</button>
              <button onClick={() => handleDeleteTeam(team._id)} style={{ backgroundColor: 'red', color: 'white' }}>
                Delete Team
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default TeamForm;
