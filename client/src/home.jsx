import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbArrowForwardUp } from "react-icons/tb";
import { MdModeEditOutline } from "react-icons/md";
import Button from '@mui/material/Button';
import './home.css'

const Home = () => {
    const [tournalist, settournalist] = useState([]);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        fetchTournament();
    }, []);

    const redirectee = (tournaid) => {
        navigate(`/scores/${tournaid}`); // Use navigate instead of Navigate
    };
    const redirecteedit = (tournaid) => {
        navigate(`/input/${tournaid}`); // Use navigate instead of Navigate
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

    return (
        <div className='home'>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>S.no</th>
                        <th>Tournament Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tournalist?.map((tourn, ind) => (
                        <tr key={ind}>
                            <td>{ind + 1}</td>
                            <td>{tourn.tournName}</td>
                            <td>
                                <Button variant="outlined" onClick={()=> redirectee(tourn._id)} startIcon={<TbArrowForwardUp />}>
                                    Live
                                </Button>
                                <Button variant="outlined" onClick={()=> redirecteedit(tourn._id)} startIcon={<MdModeEditOutline />}>
                                    Edit
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
