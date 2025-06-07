import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import { Link, useNavigate } from 'react-router-dom';

const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const Home = () => {
    const [agents, setAgents] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '', countryCode: '+91', password: '' });
    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return; // Prevents fetching agents
    }

    const fetchAgents = async () => {
        try {
            const res = await axiosInstance.get('/admin/getUsers');
            setAgents(res.data || []);
        } catch (err) {
            console.error('Error fetching agents:', err);
            setAgents([]); // fallback to empty
        }
    };
    fetchAgents();
}, [refresh, navigate]);


    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
        if (!/^\d{7,}$/.test(formData.mobile)) newErrors.mobile = 'Enter a valid mobile number';
        if (!formData.password || formData.password.length < 6) newErrors.password = 'Minimum 6 characters required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        try {
            const fullMobile = `${formData.countryCode}${formData.mobile}`;
            const payload = {
                ...formData,
                mobile: fullMobile
            };
            await axiosInstance.post('/admin/create-User', payload);
            setFormData({ name: '', email: '', mobile: '', countryCode: '+91', password: '' });
            setErrors({});
            alert('Agent created successfully');
            setRefresh(!refresh);
        } catch (err) {
            console.error(err);
            alert('Failed to create agent');
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        if (!allowedTypes.includes(selected.type)) {
            setFile(null);
            setFileError('Only .csv, .xls, .xlsx files allowed');
        } else {
            setFile(selected);
            setFileError('');
        }
    };

    const handleDistribute = async () => {
        if (!file) {
            alert('Upload a valid file first');
            return;
        }

        const form = new FormData();
        form.append('file', file);

        try {
            await axiosInstance.post('/admin/upload-list', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('List distributed successfully');
            setFile(null);
            setRefresh(!refresh);
        } catch (err) {
            console.error(err);
            alert('Failed to distribute list');
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.get('/user/logout');
            navigate('/login');
        } catch (err) {
            alert('Logout failed');
        }
    };

    return (
        <div className="relative max-w-5xl mx-auto p-8 space-y-10 bg-gray-100 min-h-screen">
            <button
                onClick={handleLogout}
                className="absolute top-8 right-8 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold shadow"
            >
                Logout
            </button>

            <h1 className="text-3xl font-bold text-center text-gray-800">Admin Dashboard</h1>

            {/* Create Agent */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">1. Create Agent</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                    <div className="flex space-x-2">
                        <select
                            value={formData.countryCode}
                            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                            className="w-[20%] px-2 py-2 border rounded-md text-sm"
                        >
                            <option value="+91">+91 (IN)</option>
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (AU)</option>
                            <option value="+81">+81 (JP)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Mobile number"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="w-[80%] px-4 py-2 border rounded-md"
                        />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-sm md:col-span-2">{errors.mobile}</p>}

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Create Agent
                        </button>
                    </div>
                </form>
            </div>

            {/* Upload File */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">2. Upload File</h2>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
            </div>

            {/* Distribute List */}
            <div className="text-center">
                <button
                    onClick={handleDistribute}
                    disabled={!file}
                    className={`px-6 py-3 rounded-lg font-semibold shadow transition ${
                        file
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                >
                    Distribute List
                </button>
            </div>

            {/* All Agents */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">All Agents</h2>
                {agents.length === 0 ? (
                    <p className="text-gray-500">No agents available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-3 border-b">Name</th>
                                    <th className="p-3 border-b">Email</th>
                                    <th className="p-3 border-b">Mobile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent) => (
                                    <tr key={agent._id} className="border-t text-sm hover:bg-gray-50">
                                        <td className="p-3 border-b">
                                            <Link to={`/agent/${agent._id}`} className="text-inherit hover:underline">
                                                {agent.name}
                                            </Link>
                                        </td>
                                        <td className="p-3 border-b">
                                            <Link to={`/agent/${agent._id}`} className="text-inherit hover:underline">
                                                {agent.email}
                                            </Link>
                                        </td>
                                        <td className="p-3 border-b">
                                            <Link to={`/agent/${agent._id}`} className="text-inherit hover:underline">
                                                {agent.mobile}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
