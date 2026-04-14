import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';

const DoctorDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [queue, setQueue] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [stats, setStats] = useState({ waiting: 0, completed: 0, cancelled: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { fetchDepartments(); }, []);

  const fetchQueue = useCallback(async (deptId) => {
    if (!deptId) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/tokens/queue/${deptId}`);
      setQueue(data);
      setStats({
        waiting: data.filter(t => t.status === 'waiting').length,
        completed: data.filter(t => t.status === 'completed').length,
        cancelled: data.filter(t => t.status === 'cancelled').length,
        total: data.length,
      });
      const serving = data.find(t => ['in-consultation', 'called'].includes(t.status));
      setCurrentServing(serving || null);
    } catch (err) {
      showToast('Failed to load queue', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    fetchQueue(selectedDept);

    const socket = io(import.meta.env.VITE_SOCKET_URL);
    socket.emit('join-department', selectedDept);
    socket.on('new-token', () => {
      fetchQueue(selectedDept);
      showToast('New patient joined the queue!', 'info');
    });
    socket.on('token-status-update', () => fetchQueue(selectedDept));
    socket.on('token-cancelled', () => {
      fetchQueue(selectedDept);
      showToast('A patient cancelled their token', 'warning');
    });

    return () => socket.disconnect();
  }, [selectedDept, fetchQueue]);

  const fetchDepartments = async () => {
    try {
      const { data } = await API.get('/departments');
      setDepartments(data);
    } catch (err) {
      showToast('Failed to load departments', 'error');
    }
  };

  const updateStatus = async (tokenId, status, label) => {
    setActionLoading(tokenId + status);
    try {
      await API.put(`/tokens/${tokenId}/status`, { status });
      showToast(`Token marked as ${label || status}`);
      fetchQueue(selectedDept);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusColor = (status) => ({
    waiting: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    called: 'bg-blue-100 text-blue-700 border border-blue-200',
    'in-consultation': 'bg-purple-100 text-purple-700 border border-purple-200',
    completed: 'bg-green-100 text-green-700 border border-green-200',
    cancelled: 'bg-red-100 text-red-700 border border-red-200',
  }[status] || 'bg-gray-100 text-gray-700');

  const waitingQueue = queue.filter(t => t.status === 'waiting');
  const isLoading = (id, status) => actionLoading === id + status;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
          {selectedDept && (
            <button
              onClick={() => fetchQueue(selectedDept)}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              ↻ Refresh
            </button>
          )}
        </div>

        {/* Department Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
          >
            <option value="">Choose department...</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {selectedDept && (
          loading ? <Spinner text="Loading queue..." /> : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Waiting', value: stats.waiting, color: 'text-yellow-500' },
                  { label: 'Completed', value: stats.completed, color: 'text-green-500' },
                  { label: 'Cancelled', value: stats.cancelled, color: 'text-red-400' },
                  { label: 'Total Today', value: stats.total, color: 'text-teal-500' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Currently Serving */}
              {currentServing ? (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-purple-600">Currently Serving</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-5xl font-black text-purple-600">#{currentServing.tokenNumber}</p>
                      <p className="text-gray-700 font-semibold text-lg mt-1">{currentServing.patient?.name}</p>
                      <p className="text-gray-400 text-sm">{currentServing.patient?.phone || currentServing.patient?.email}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {currentServing.status === 'called' && (
                        <button
                          onClick={() => updateStatus(currentServing._id, 'in-consultation', 'In Consultation')}
                          disabled={isLoading(currentServing._id, 'in-consultation')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                        >
                          {isLoading(currentServing._id, 'in-consultation') ? 'Updating...' : 'Start Consultation'}
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(currentServing._id, 'completed', 'Completed')}
                        disabled={isLoading(currentServing._id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                      >
                        {isLoading(currentServing._id, 'completed') ? 'Updating...' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl p-4 mb-6 text-center text-gray-400 text-sm">
                  No patient currently being served
                </div>
              )}

              {/* Waiting Queue */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Waiting Queue</h3>
                    <p className="text-xs text-gray-400">{waitingQueue.length} patient{waitingQueue.length !== 1 ? 's' : ''} in queue</p>
                  </div>
                  {waitingQueue.length > 0 && (
                    <button
                      onClick={() => updateStatus(waitingQueue[0]._id, 'called', 'Called')}
                      disabled={!!currentServing || isLoading(waitingQueue[0]._id, 'called')}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading(waitingQueue[0]._id, 'called') ? 'Calling...' : 'Call Next Patient'}
                    </button>
                  )}
                </div>

                {waitingQueue.length === 0 ? (
                  <EmptyState
                    title="Queue is empty"
                    subtitle="No patients waiting right now. New tokens will appear here in real-time."
                    icon="✅"
                  />
                ) : (
                  <div className="space-y-2">
                    {waitingQueue.map((token, index) => (
                      <div key={token._id} className={`flex items-center justify-between p-4 rounded-xl transition ${
                        index === 0 ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            #{token.tokenNumber}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 text-sm">{token.patient?.name}</p>
                            <p className="text-xs text-gray-400">{token.patient?.phone || token.patient?.email}</p>
                          </div>
                          {index === 0 && (
                            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">Next</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(token.status)}`}>
                            {token.status}
                          </span>
                          <button
                            onClick={() => updateStatus(token._id, 'called', 'Called')}
                            disabled={!!currentServing || isLoading(token._id, 'called')}
                            className="text-teal-600 hover:text-teal-800 text-xs underline disabled:opacity-40 disabled:no-underline"
                          >
                            Call
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;