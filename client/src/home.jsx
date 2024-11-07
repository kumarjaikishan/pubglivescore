import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbArrowForwardUp } from "react-icons/tb";
import { MdModeEditOutline } from "react-icons/md";
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
        console.log("called")
        try {
            const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}tournalist`);
            const data = await response.json();
            console.log(data);
            console.log(response)
            settournalist(data.tournament); // Set the fetched tournaments
        } catch (error) {
            console.error('Error fetching tournaments:', error.message);
        }
    };

    return (
        <div className='home'>
            {tournalist?.map((tourn, ind) => (
                <div key={ind}>
                    <span>{tourn.tournName}</span>
                    <span onClick={() => redirectee(tourn._id)}><TbArrowForwardUp /> </span>
                    <span onClick={() => redirecteedit(tourn._id)}><MdModeEditOutline /> </span>
                </div>
            ))}
        </div>
    );
};

export default Home;
