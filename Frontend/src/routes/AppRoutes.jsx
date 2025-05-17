import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Home from '../pages/Home';
import Agent from '../pages/Agent';

const AppRoutes = () => {
    return (
        <BrowserRouter>
        <Routes>
            {/* Define your routes here */}
            <Route path="/" element={<Home/>} />
            <Route path="/agent/:id" element={<Agent/>} />
            <Route path="/login" element={<Login />} />            {/* Add more routes as needed */}
            <Route path="/signup" element={<Registration/>} />
            
                        {/* Add more routes as needed */}
        </Routes>
        </BrowserRouter>
    );
    }

export default AppRoutes;