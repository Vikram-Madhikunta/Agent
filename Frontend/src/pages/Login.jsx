import React , {useState}from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../config/axios.js';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';


  const handleSubmit = (e) => {
  e.preventDefault();

  axiosInstance.post('/user/login', {
    email,
    password
  })
  .then((response) => {
    const { token, user } = response.data;

    localStorage.setItem('token', token);

    // Redirect based on user type
    if (user.type === 'admin') {
      navigate('/', { replace: true });
    } else if (user.type === 'agent') {
      navigate(`/agent/${user._id}`, { replace: true });
    } else {
      setError('Unknown user type');
    }
  })
  .catch((error) => {
    console.error(error);
    setError(error.response ? error.response.data.error : 'An error occurred');
  });
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 px-4">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 sm:p-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 rounded-full p-3 mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Sign in to your account</h2>
          <p className="text-gray-500 mt-2 text-sm">Welcome back! Please enter your details.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
         
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition duration-200"
          >
            Sign In
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
