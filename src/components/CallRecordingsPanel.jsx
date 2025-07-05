import { useState, useEffect } from 'react';

const toneIcon = (tone) => {
  if (!tone) return '';
  const t = tone.toLowerCase();
  if (t.includes('interested')) return '😊';
  if (t.includes('neutral')) return '😐';
  if (t.includes('rude') || t.includes('angry')) return '😠';
  if (t.includes('unconvinced')) return '🤔';
  if (t.includes('happy')) return '😃';
  if (t.includes('sad')) return '😢';
  return '🗣️';
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'N/A';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
};

export default function CallRecordingsPanel() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://pratham-server.onrender.com/api/call-recordings');
      const data = await response.json();
      const filtered = (data.recordings || []).filter(call => Number(call.answeredtime) > 0);
      setCalls(filtered);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (docId) => {
    setAnalyzingId(docId);
    try {
      await fetch('https://pratham-server.onrender.com/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId })
      });
      await fetchCalls();
    } catch (err) {
      alert('Failed to analyze call.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    // Simple skeleton loader
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📞 Call Recordings & Analysis</h1>
        {calls.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">No call recordings found</div>
            <p className="text-gray-400">
              Call recordings will appear here once MCUBE callbacks are received.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {calls.map((call, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                      {call.executive || 'Unknown Agent'}
                      </h3>
                    <p className="text-gray-600">Customer: {call.customer || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Call ID: {call.callid}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      call.status === 'Call Complete'
                          ? 'bg-green-100 text-green-800'
                        : call.status === 'Customer Busy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {call.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Call Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Start Time:</strong> {call.starttime}</p>
                      <p><strong>End Time:</strong> {call.endtime}</p>
                      <p><strong>Duration:</strong> {formatDuration(Number(call.duration))}</p>
                      <p><strong>Answered Time:</strong> {formatDuration(Number(call.answeredtime))}</p>
                      <p><strong>Received At:</strong> {call.receivedAt ? new Date(call.receivedAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recording</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 break-all">
                        <strong>URL:</strong> {call.filename || 'No recording URL'}
                      </p>
                      {call.filename && (
                        <audio controls src={call.filename} style={{ maxWidth: 300 }} />
                      )}
                      {call.analysis && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(index)}>
                            <h4 className="font-medium text-gray-900 mb-1">AI Analysis</h4>
                            <span className="text-blue-600 text-xs">{expanded[index] ? 'Hide' : 'Show'}</span>
                          </div>
                          {expanded[index] && (
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Summary:</strong> {call.analysis.summary}</p>
                              <p>
                                <strong>Pitch Score:</strong>{' '}
                                <span style={{
                                  color:
                                    call.analysis.pitchScore >= 7 ? 'green' :
                                    call.analysis.pitchScore <= 4 ? 'red' : 'orange',
                                  fontWeight: 'bold'
                                }}>
                                  {call.analysis.pitchScore}/10
                                </span>
                              </p>
                              <p><strong>Mistakes:</strong> {Array.isArray(call.analysis.mistakes) ? call.analysis.mistakes.join(', ') : call.analysis.mistakes}</p>
                              <p><strong>Customer Tone:</strong> {toneIcon(call.analysis.customerTone)} {call.analysis.customerTone}</p>
                              <p><strong>Recommendation:</strong> {call.analysis.recommendation}</p>
                              <p><strong>Follow Up Suggestion:</strong> {call.analysis.followUpSuggestion}</p>
                            <button
                                className="mt-2 px-3 py-1 bg-blue-200 text-blue-900 rounded text-xs hover:bg-blue-300"
                                onClick={() => {
                                  const text = `Summary: ${call.analysis.summary}\nPitch Score: ${call.analysis.pitchScore}/10\nMistakes: ${Array.isArray(call.analysis.mistakes) ? call.analysis.mistakes.join(', ') : call.analysis.mistakes}\nCustomer Tone: ${call.analysis.customerTone}\nRecommendation: ${call.analysis.recommendation}\nFollow Up Suggestion: ${call.analysis.followUpSuggestion}`;
                                  const blob = new Blob([text], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `call-analysis-${call.callid}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                Download Analysis
                            </button>
                          </div>
                        )}
                      </div>
                      )}
                    </div>
                  </div>
                </div>
                {call.transcript && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand('t' + index)}>
                      <h4 className="font-medium text-gray-900 mb-1">Call Transcript</h4>
                      <span className="text-blue-600 text-xs">{expanded['t' + index] ? 'Hide' : 'Show'}</span>
                    </div>
                    {expanded['t' + index] && (
                      <p className="text-sm text-gray-600 whitespace-pre-line">{call.transcript}</p>
                    )}
                    <button
                      className="mt-2 px-3 py-1 bg-blue-200 text-blue-900 rounded text-xs hover:bg-blue-300"
                      onClick={() => {
                        const blob = new Blob([call.transcript], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `call-transcript-${call.callid}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download Transcript
                    </button>
                  </div>
                )}
                {(!call.transcript || !call.analysis) && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => triggerAnalysis(call.docId)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      disabled={analyzingId === call.docId}
                    >
                      {analyzingId === call.docId ? 'Analyzing...' : 'Analyze Call'}
                    </button>
                    </div>
                  )}
                </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            onClick={fetchCalls}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Refresh Recordings
          </button>
        </div>
      </div>
    </div>
  );
} 
