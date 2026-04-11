import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-black text-teal-100">404</p>
        <h2 className="text-2xl font-bold text-gray-700 -mt-4">Page not found</h2>
        <p className="text-gray-400 mt-2 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default NotFound;