import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbArrowForwardUp } from "react-icons/tb";
import { MdModeEditOutline } from "react-icons/md";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './home.css'

const Home = () => {
    const [tournalist, settournalist] = useState([]);
    const [tournamentName, settournamentName] = useState('')
    const [killpoints, setkillpoints] = useState('')
    const [modal, setmodal] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        fetchTournament();
    }, []);

    const redirectee = (tournaid) => {
        navigate(`/scores/${tournaid}`); // Use navigate instead of Navigate
    };
    const redirectinput = (tournaid) => {
        navigate(`/input/${tournaid}`); // Use navigate instead of Navigate
    };
    const redirectedit = (tournaid) => {
        navigate(`/register/${tournaid}`); // Use navigate instead of Navigate
    };

    const fetchTournament = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}tournalist`);
            const data = await response.json();
            // console.log(data);
            // console.log(response)
            settournalist(data.tournament); // Set the fetched tournaments
        } catch (error) {
            console.error('Error fetching tournaments:', error.message);
        }
    };
    const addTournament = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}addtournament`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tournamentName, killpoints })
            });

            if (response.ok) {
                fetchTournament();
                alert('Team created successfully');
            } else {
                console.error('Failed to delete team');
            }
        } catch (error) {
            console.error('Error deleting team:', error);
        }
    };
    const deletee = async (tournId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}deletetournament/${tournId}`);
            const data = await response.json();
            fetchTournament();
            alert(data.message)
            console.log(data);
        } catch (error) {
            console.error('Error fetching tournaments:', error.message);
        }
    };

    return (
        <div className='home'>
            <Button variant="contained" onClick={() => setmodal(true)} startIcon={<MdModeEditOutline />}>
                Add Tournament
            </Button>
            {modal && <div className="modal">
                <TextField size='small' id="outlined-basic" value={tournamentName} label="Tournament Name" onChange={(e) => settournamentName(e.target.value)} variant="outlined" />
                <TextField size='small' id="outlined-basic" value={killpoints} type='tel' label="Kill Points" onChange={(e) => setkillpoints(e.target.value)} variant="outlined" />
                <Button size='small' variant="contained" onClick={addTournament} startIcon={<MdModeEditOutline />}>
                    Create
                </Button>
            </div>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>S.no</th>
                        <th>Tournament Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {tournalist.length < 1 && <tr><td colSpan={3}>No Tournament found</td></tr> }
                    {tournalist?.map((tourn, ind) => (
                        <tr key={ind}>
                            <td>{ind + 1}</td>
                            <td>{tourn.tournName}</td>
                            <td>
                                <Button variant="outlined" onClick={() => redirectee(tourn._id)} startIcon={<TbArrowForwardUp />}>
                                    Live
                                </Button>
                                <Button variant="outlined" onClick={() => redirectinput(tourn._id)} startIcon={<MdModeEditOutline />}>
                                    Update
                                </Button>
                                <Button variant="outlined" onClick={() => redirectedit(tourn._id)} startIcon={<MdModeEditOutline />}>
                                    Edit Teams
                                </Button>
                                <Button variant="outlined" onClick={() => deletee(tourn._id)} startIcon={<MdModeEditOutline />}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>

    );
};

export default Home;
