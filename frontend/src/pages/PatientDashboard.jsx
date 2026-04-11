import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';

const PatientDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [activeToken, setActiveToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchAll = useCallback(async () => {
    try {
      const [deptRes, tokenRes] = await Promise.all([
        API.get('/departments'),
        API.get('/tokens/my'),
      ]);
      setDepartments(deptRes.data);
      setMyTokens(tokenRes.data);
      const active = tokenRes.data.find(t =>
        ['waiting', 'called', 'in-consultation'].includes(t.status)
      );
      setActiveToken(active || null);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!activeToken) return;
    const socket = io('http://localhost:5000');
    socket.emit('join-department', activeToken.department._id);

    socket.on('token-status-update', (data) => {
      if (data.tokenId === activeToken._id) {
        setActiveToken(prev => ({ ...prev, status: data.status }));
        if (data.status === 'called') showToast('Your turn! Please proceed to the doctor.', 'info');
        if (data.status === 'completed') {
          showToast('Consultation completed!', 'success');
          fetchAll();
        }
      }
    });

    socket.on('token-cancelled', fetchAll);
    return () => socket.disconnect();
  }, [activeToken?._id, fetchAll]);

  const bookToken = async () => {
    if (!selectedDept) return showToast('Please select a department', 'warning');
    setBooking(true);
    try {
      const { data } = await API.post('/tokens/book', { departmentId: selectedDept });
      showToast(`Token #${data.tokenNumber} booked successfully!`);
      await fetchAll();
      setSelectedDept('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book token', 'error');
    } finally {
      setBooking(false);
    }
  };

  const cancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel your token?')) return;
    setCancelling(true);
    try {
      await API.put(`/tokens/${tokenId}/cancel`);
      showToast('Token cancelled successfully', 'info');
      setActiveToken(null);
      await fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => ({
    waiting: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    called: 'bg-blue-100 text-blue-700 border border-blue-200',
    'in-consultation': 'bg-purple-100 text-purple-700 border border-purple-200',
    completed: 'bg-green-100 text-green-700 border border-green-200',
    cancelled: 'bg-red-100 text-red-700 border border-red-200',
  }[status] || 'bg-gray-100 text-gray-700');

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Spinner text="Loading your dashboard..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Patient Dashboard</h2>
          <button
            onClick={fetchAll}
            className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Active Token Card */}
        {activeToken ? (
          <div className={`rounded-2xl p-6 mb-6 border-2 transition-all ${
            activeToken.status === 'called'
              ? 'bg-blue-50 border-blue-400 shadow-blue-100 shadow-lg'
              : activeToken.status === 'in-consultation'
              ? 'bg-purple-50 border-purple-400'
              : 'bg-teal-50 border-teal-300'
          }`}>
            {activeToken.status === 'called' && (
              <div className="bg-blue-500 text-white text-center py-2 rounded-xl mb-4 font-semibold animate-pulse">
                Your turn! Please proceed to the doctor now.
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Your Active Token</p>
                <p className="text-6xl font-black text-teal-600">#{activeToken.tokenNumber}</p>
                <p className="text-gray-600 mt-1 font-medium">{activeToken.department?.name}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(activeToken.status)}`}>
                  {activeToken.status.replace('-', ' ')}
                </span>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
                  <p className="text-xs text-gray-400 mb-1">Est. Wait</p>
                  <p className="text-3xl font-bold text-gray-700">{activeToken.estimatedWait}</p>
                  <p className="text-xs text-gray-400">minutes</p>
                </div>
                {activeToken.status === 'waiting' && (
                  <button
                    onClick={() => cancelToken(activeToken._id)}
                    disabled={cancelling}
                    className="text-sm text-red-500 hover:text-red-700 underline disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Token'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Book Token Card */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Book a Token</h3>
            <p className="text-sm text-gray-400 mb-4">Select a department and get in the queue instantly</p>
            <div className="flex gap-3">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
              >
                <option value="">Select Department...</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              <button
                onClick={bookToken}
                disabled={booking || !selectedDept}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {booking ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Booking...
                  </span>
                ) : 'Book Token'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-bold text-teal-600">{myTokens.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total Visits</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-bold text-green-500">
              {myTokens.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-bold text-yellow-500">
              {myTokens.filter(t => t.status === 'waiting').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Waiting</p>
          </div>
        </div>

        {/* Token History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Token History</h3>
          {myTokens.length === 0 ? (
            <EmptyState
              title="No tokens yet"
              subtitle="Book your first token above to get started"
              icon="🎫"
            />
          ) : (
            <div className="space-y-2">
              {myTokens.map(token => (
                <div key={token._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                      <span className="text-teal-700 font-bold text-sm">#{token.tokenNumber}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{token.department?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(token.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(token.status)}`}>
                    {token.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;