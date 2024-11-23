import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdModeEditOutline } from "react-icons/md";
import './registration.css'

const TeamForm = () => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['alive', 'alive', 'alive', 'alive']);
  const [logoPreview, setLogoPreview] = useState('');
  const [teamList, setTeamList] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const { tournamentId } = useParams();

  useEffect(() => {
    fetchTournamentone();
  }, []);


  const fetchTournamentone = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}teamlist/${tournamentId}`);
      const data = await response.json();
      setTeamList(data.team);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { tournamentId, teamName, players, logo: logoPreview };

    try {
      let response;
      if (editingTeam) {
        response = await fetch(`${import.meta.env.VITE_API_ADDRESS}updateteam/${editingTeam._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_ADDRESS}register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const newOrUpdatedTeam = await response.json();
        // if (editingTeam) {
        //   setTeamList((prevList) =>
        //     prevList.map((team) => (team._id === editingTeam._id ? newOrUpdatedTeam : team))
        //   );
        // } else {
        //   setTeamList((prevList) => [...prevList, newOrUpdatedTeam]);
        // }
        fetchTournamentone();
        resetForm();
        setEditingTeam(null);
        alert(newOrUpdatedTeam.message);
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
    setPlayers(['alive', 'alive', 'alive', 'alive']);
    setLogoPreview('');
  };

  // Move team up based on order
  const moveTeamUp = (index) => {
    if (index > 0) {
      const updatedList = [...teamList];

      // Swap the order between the current team and the previous team
      const temp = updatedList[index].order;
      updatedList[index].order = updatedList[index - 1].order;
      updatedList[index - 1].order = temp;

      // Re-sort the list based on the updated order field
      updatedList.sort((a, b) => a.order - b.order);

      setTeamList(updatedList);
    }
  };

  // Move team down based on order
  const moveTeamDown = (index) => {
    console.log("move down")
    if (index < teamList.length - 1) {
      const updatedList = [...teamList];

      // Swap the order between the current team and the next team
      const temp = updatedList[index].order;
      updatedList[index].order = updatedList[index + 1].order;
      updatedList[index + 1].order = temp;

      // Re-sort the list based on the updated order field
      updatedList.sort((a, b) => a.order - b.order);
      setTeamList(updatedList);
    }
  };


  // Handle team deletion
  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}deleteteam/${teamId}`, {
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
  const savechanges = async (teamId) => {
    // console.log(teamList)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}savelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamList),
      });

      if (response.ok) {
        // setTeamList((prevList) => prevList.filter((team) => team._id !== teamId));
        alert('Team Updated successfully');
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
    setPlayers(team.players);
    setLogoPreview(team.logo);
  };

  return (
    <div className='register'>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>{editingTeam ? 'Edit Team' : 'Register Team'}</h2>
        <label>
          Team Name
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </label>
        <label>
          Team Logo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoPreview(URL.createObjectURL(e.target.files[0]))}
          />
          {logoPreview && <img src={logoPreview} alt="Team Logo" style={{ width: '100px', marginTop: '10px' }} />}
          </label>
        <br />
        <Button variant="contained" type='submit' color='secondary' startIcon={<MdModeEditOutline />}>
        {editingTeam ? 'Update Team' : 'Register Team'}
            </Button>
        {/* <button type="submit">{editingTeam ? 'Update Team' : 'Register Team'}</button> */}
      </form>

      <div className='teams' style={{ width: '100%' }}>
        <h3>Registered Teams</h3>
        <button onClick={savechanges}>Save</button>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Team Name</th>
              <th>Actions</th>
              <th>Move</th>
            </tr>
          </thead>
          <tbody>
            {!teamList && <tr><td colSpan={4}>No Team Found</td></tr>}
            {teamList && teamList.sort((a, b) => b.order - a.order).map((team, ind) => (
              <tr key={team._id}>
                <td>{ind + 1}</td>
                <td>{team.teamName}</td>
                <td>
                  <button onClick={() => handleEditTeam(team)}>Edit</button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    style={{ backgroundColor: 'red', color: 'white', marginLeft: '10px' }}
                  >
                    Delete
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => moveTeamUp(ind)}
                    style={{ marginLeft: '10px' }}
                    disabled={ind === 0}
                  >
                    Up
                  </button>
                  <button
                    onClick={() => moveTeamDown(ind)}
                    style={{ marginLeft: '10px' }}
                    disabled={ind === teamList.length - 1}
                  >
                    Down
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamForm;
