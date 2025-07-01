import { useState, useEffect } from 'react';

export default function CallRecordingsPanel() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  const scriptUrl = 'https://script.google.com/macros/s/AKfycbwzfrMTurwHJ7BllZuCpMLzrmZC8nOraJ2eEOhY4ZCuWgWn50zZ3A4nwwb-a9tTdAmr/exec';

  useEffect(() => {
    fetchLeadsWithRecordings();
  }, []);

  const fetchLeadsWithRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${scriptUrl}?action=getAllLeads`);
      const data = await response.json();
      
      // Filter leads that have recordings
      const leadsWithRecordings = data.filter(lead => {
        try {
          const recordings = JSON.parse(lead.Recordings || '{}');
          return recordings.url && recordings.url.trim() !== '';
        } catch (e) {
          return false;
        }
      });
      
      setLeads(leadsWithRecordings);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseRecordingInfo = (recordingsJson) => {
    try {
      return JSON.parse(recordingsJson || '{}');
    } catch (e) {
      return {};
    }
  };

  const downloadRecording = async (recordingUrl, callId) => {
    try {
      const response = await fetch(recordingUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${callId}.wav`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download recording. URL may be expired or inaccessible.');
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      alert('Error downloading recording. Please try again.');
    }
  };

  const openRecordingInNewTab = (recordingUrl) => {
    window.open(recordingUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading recordings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📞 Call Recordings</h1>
        
        {leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">No recordings found</div>
            <p className="text-gray-400">
              Call recordings will appear here once MCUBE callbacks are received.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {leads.map((lead, index) => {
              const recordingInfo = parseRecordingInfo(lead.Recordings);
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {lead.Name || 'Unknown Name'}
                      </h3>
                      <p className="text-gray-600">{lead.Phone || 'No phone'}</p>
                      <p className="text-sm text-gray-500">Lead ID: {lead['Lead ID']}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        recordingInfo.status === 'Call complete' 
                          ? 'bg-green-100 text-green-800'
                          : recordingInfo.status === 'Customer Busy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recordingInfo.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Call Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Call ID:</strong> {recordingInfo.callId || 'N/A'}</p>
                        <p><strong>Duration:</strong> {recordingInfo.duration || 'N/A'} seconds</p>
                        <p><strong>Answered Time:</strong> {recordingInfo.answeredTime || 'N/A'} seconds</p>
                        <p><strong>Timestamp:</strong> {recordingInfo.timestamp ? new Date(recordingInfo.timestamp).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recording</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 break-all">
                          <strong>URL:</strong> {recordingInfo.url || 'No recording URL'}
                        </p>
                        {recordingInfo.url && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openRecordingInNewTab(recordingInfo.url)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              🎵 Play
                            </button>
                            <button
                              onClick={() => downloadRecording(recordingInfo.url, recordingInfo.callId)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              💾 Download
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {lead['Feedback 1'] && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h4 className="font-medium text-gray-900 mb-1">Feedback</h4>
                      <p className="text-sm text-gray-600">{lead['Feedback 1']}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchLeadsWithRecordings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Refresh Recordings
          </button>
        </div>
      </div>
    </div>
  );
} 