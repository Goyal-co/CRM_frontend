import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function CallRecordingsPanel() {
  const [recordings, setRecordings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRecordings();
    fetchStats();
  }, [page]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/recordings?page=${page}&limit=10`);
      const data = await response.json();
      setRecordings(data.recordings);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/call-stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Call complete': return 'text-green-600 bg-green-100';
      case 'Customer Busy': return 'text-yellow-600 bg-yellow-100';
      case 'Executive Busy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const playRecording = (recording) => {
    if (recording.firebaseRecordingUrl) {
      window.open(recording.firebaseRecordingUrl, '_blank');
    } else {
      alert('No recording available for this call');
    }
  };

  const downloadRecordingToFirebase = async (callId, agent, customer) => {
    try {
      const res = await fetch(`${API_URL}/api/download-recording`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, agent, customer })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Recording downloaded and uploaded to Firebase!');
        fetchRecordings(); // Refresh list
      } else {
        alert('❌ Download failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📞 Call Recordings</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Calls</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">With Recordings</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.recordingsWithAudio}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Duration</h3>
            <p className="text-2xl font-bold text-orange-600">{formatDuration(stats.averageDuration)}</p>
          </div>
        </div>
      )}

      {/* Recordings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Call Recordings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Call Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recording
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Analysis
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recordings.map((recording) => (
                <tr key={recording.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {recording.executive} → {recording.customer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(recording.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {recording.callId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDuration(recording.duration)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(recording.status)}`}>
                      {recording.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {recording.firebaseRecordingUrl ? (
                      <button
                        onClick={() => playRecording(recording)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        🎵 Play
                      </button>
                    ) : (
                      recording.status === 'Call complete' ? (
                        <button
                          onClick={() => downloadRecordingToFirebase(recording.callId, recording.executive, recording.customer)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          ⬇️ Download Recording
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No recording</span>
                      )
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      recording.analysisStatus === 'completed' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-yellow-600 bg-yellow-100'
                    }`}>
                      {recording.analysisStatus || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 