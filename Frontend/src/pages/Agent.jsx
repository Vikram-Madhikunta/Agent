import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        setTasks(res.data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Agent Task Report', 14, 20);

    const tableData = tasks.map((task, index) => [
      index + 1,
      task.Name || 'N/A',
      task.TransactionID || 'N/A',
      `₹${Number(task.Amount).toLocaleString('en-IN')}`,
      task.Date ? new Date(task.Date).toLocaleDateString('en-IN') : 'N/A',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Name', 'Transaction ID', 'Amount', 'Date']],
      body: tableData,
    });

    doc.save('agent-tasks.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Payslip for Employee</h1>

      {loading ? (
        <p className="text-gray-500">Loading Payslips...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No Payslips assigned.</p>
      ) : (
        <>
          <div className="bg-white rounded shadow p-4 overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Transaction ID</th>
                  <th className="p-3 border-b">Amount</th>
                  <th className="p-3 border-b">Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{task.Name}</td>
                    <td className="p-3 border-b">{task.TransactionID}</td>
                    <td className="p-3 border-b">₹{Number(task.Amount).toLocaleString('en-IN')}</td>
                    <td className="p-3 border-b">
                      {task.Date ? new Date(task.Date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Download PDF
          </button>
        </>
      )}
    </div>
  );
};

export default Agent;
