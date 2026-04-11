import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-teal-600 mb-2">Welcome, {user?.name}!</h2>
        <p className="text-gray-500 mb-1">Role: <span className="font-medium capitalize">{user?.role}</span></p>
        <p className="text-gray-400 text-sm mb-6">Full dashboard coming on Day 4!</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;