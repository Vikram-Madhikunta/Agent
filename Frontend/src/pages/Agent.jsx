import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import { useParams, useNavigate } from 'react-router-dom';

const Agent = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axiosInstance.get(`/admin/assigned-tasks/${id}`);
        console.log("Fetched tasks:", res.data);
        setTasks(res.data || []); 
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tasks for Agent</h1>

      {loading ? (
        <p className="text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned.</p>
      ) : (
        <div className="bg-white rounded shadow p-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 border-b">#</th>
                <th className="p-3 border-b">First Name</th>
                <th className="p-3 border-b">Phone</th>
                <th className="p-3 border-b">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">{task.FirstName}</td>
                  <td className="p-3 border-b">{task.Phone}</td>
                  <td className="p-3 border-b">{task.Notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Agent;
