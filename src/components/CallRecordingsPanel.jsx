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

// Agent name mapping (phone number to name)
const agentNameMap = {
  '+919686602879': 'Pratham',
  '+919999999999': 'Srinivas',
  '+917777777777': 'Sahil',
  '+919014600977': 'Avula Rudra',
  '+919620660817': 'Test Agent',
  '919686602879': 'Pratham',
  '919999999999': 'Srinivas',
  '917777777777': 'Sahil',
  '919014600977': 'Avula Rudra',
  '919620660817': 'Test Agent',
  '9686602879': 'Pratham',
  '9999999999': 'Srinivas',
  '7777777777': 'Sahil',
  '9014600977': 'Avula Rudra',
  '9620660817': 'Test Agent',
  // Add more mappings as needed
};

// Project name mapping (form ID to project name)
const projectNameMap = {
  '376840518773731': 'Orchid Salisbury-Aug-24',
  '793235552669212': 'Orchid Platinum-March 2024',
  '758750669703946': 'Orchid Life',
  '836984054637126': 'Orchid Bloomsberry',
  '655063727089499': 'Riviera Uno – Feb 2025',
};

// Get agent name from phone number
const getAgentName = (phoneNumber) => {
  if (!phoneNumber) return 'Unknown Agent';
  
  // Try different formats
  const formats = [
    phoneNumber,
    phoneNumber.replace(/^\+/, ''),
    phoneNumber.replace(/^91/, ''),
    phoneNumber.replace(/^0/, ''),
    phoneNumber.replace(/\D/g, '')
  ];
  
  for (const format of formats) {
    if (agentNameMap[format]) {
      return agentNameMap[format];
    }
  }
  
  return phoneNumber || 'Unknown Agent';
};

// Get project name from form ID or refid
const getProjectName = (formId, refid) => {
  if (formId && projectNameMap[formId]) {
    return projectNameMap[formId];
  }
  if (refid && projectNameMap[refid]) {
    return projectNameMap[refid];
  }
  return 'Unknown Project';
};

// Clean phone number for comparison
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');
};

// Find client name from leads data based on phone number only
const getClientName = (phoneNumber, leadsData) => {
  if (!phoneNumber || !leadsData || !leadsData.length) {
    console.log('[DEBUG] getClientName: Missing data - phoneNumber:', phoneNumber, 'leadsData length:', leadsData?.length);
    return 'Unknown Client';
  }
  
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  console.log('[DEBUG] getClientName: Searching for phone:', phoneNumber, 'Cleaned:', cleanPhone);
  
  let found = null;
  for (const lead of leadsData) {
    const leadPhone = cleanPhoneNumber(lead['Phone'] || lead['phone'] || lead['Mobile'] || lead['Contact'] || '');
    console.log('[DEBUG] Comparing with lead phone:', leadPhone, 'from lead:', lead['Name'] || 'No Name');
    
    if (leadPhone && (leadPhone === cleanPhone || leadPhone.endsWith(cleanPhone) || cleanPhone.endsWith(leadPhone))) {
      found = lead;
      console.log('[DEBUG] ✅ MATCH FOUND! Phone:', phoneNumber, 'matched with lead:', lead);
      break;
    }
  }
  
  if (!found) {
    console.log('[DEBUG] ❌ NO MATCH for phone:', phoneNumber, 'Cleaned:', cleanPhone);
    console.log('[DEBUG] Available phone numbers in leads:', leadsData.map(l => l['Phone'] || l['phone'] || l['Mobile'] || l['Contact'] || 'N/A'));
  }
  
  return found ? (found['Name'] || found['name'] || 'Unknown Client') : 'Unknown Client';
};

// Find project name from leads data based on phone number or lead ID
const getProjectNameFromLeads = (phoneNumber, leadsData, refid) => {
  if (!leadsData || !leadsData.length) return 'Unknown Project';
  
  let lead = null;
  
  // First try to match by Lead ID (refid) - this is most reliable
  if (refid) {
    lead = leadsData.find(lead => {
      const leadId = lead['Lead ID'] || lead['LeadId'] || lead['ID'] || lead['Id'] || lead['leadId'] || lead['lead_id'] || '';
      return leadId.toString() === refid.toString();
    });
    
    if (lead) {
      return lead['Project'] || lead['project'] || lead['Form ID'] || lead['Form Name'] || lead['Campaign'] || lead['Source'] || 'Unknown Project';
    }
  }
  
  // If no match by ID, try phone number
  if (phoneNumber && !lead) {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    
    // Try to find exact match first
    lead = leadsData.find(lead => {
      const leadPhone = cleanPhoneNumber(lead['Phone'] || lead['phone'] || lead['Phone Number'] || lead['Mobile'] || lead['Contact'] || '');
      return leadPhone === cleanPhone;
    });
    
    // If no exact match, try partial matches
    if (!lead) {
      lead = leadsData.find(lead => {
        const leadPhone = cleanPhoneNumber(lead['Phone'] || lead['phone'] || lead['Phone Number'] || lead['Mobile'] || lead['Contact'] || '');
        return leadPhone.includes(cleanPhone) || cleanPhone.includes(leadPhone);
      });
    }
    
    // If still no match, try matching last 10 digits
    if (!lead && cleanPhone.length >= 10) {
      const last10Digits = cleanPhone.slice(-10);
      lead = leadsData.find(lead => {
        const leadPhone = cleanPhoneNumber(lead['Phone'] || lead['phone'] || lead['Phone Number'] || lead['Mobile'] || lead['Contact'] || '');
        return leadPhone.endsWith(last10Digits) || leadPhone.includes(last10Digits);
      });
    }
  }
  
  return lead ? (lead['Project'] || lead['project'] || lead['Form ID'] || lead['Form Name'] || lead['Campaign'] || lead['Source'] || 'Unknown Project') : 'Unknown Project';
};

// Remove hardcoded/generated names from fallback
const createFallbackLeadsData = (recordings) => {
  const leads = [];
  recordings.forEach((call, index) => {
    if (call.refid || call.customer) {
      leads.push({
        'Lead ID': call.refid || `CALL_${index}`,
        'Project': getProjectName(call.formId, call.refid),
        'Name': call.customer || `Call ${index}`, // Show phone number as name
        'Phone': call.customer || '',
        'City': '',
        'Email': '',
        'Source': 'MCUBE Call',
        'Assigned To': getAgentName(call.executive),
        'Assigned Email': '',
        'Assigned Time': call.receivedAt ? new Date(call.receivedAt.seconds * 1000).toLocaleString() : '',
        'Called?': call.status === 'Call Complete' ? 'Yes' : 'No',
        'Call Time': call.receivedAt ? new Date(call.receivedAt.seconds * 1000).toLocaleString() : '',
        'Call Delay?': '',
        'Site Visit?': '',
        'Booked?': '',
        'Lead Quality': '',
        'Feedback 1': `Call Status: ${call.status} | Call ID: ${call.callid}`,
        'Time 1': call.receivedAt ? new Date(call.receivedAt.seconds * 1000).toLocaleString() : '',
        'Feedback 2': '',
        'Time 2': '',
        'Feedback 3': '',
        'Time 3': '',
        'Feedback 4': '',
        'Time 4': '',
        'Feedback 5': '',
        'Time 5': ''
      });
    }
  });
  return leads;
};

export default function CallRecordingsPanel() {
  const [calls, setCalls] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    agent: '',
    project: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // First fetch call recordings
      const callsResponse = await fetch('https://api.goyalhariyanacrm.in/api/call-recordings');
      const callsData = await callsResponse.json();
      setCalls(callsData.recordings || []);
      // Always use Google Apps Script for leads data
      let leadsFetched = false;
      try {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec';
        const leadsResponse = await fetch(`${scriptUrl}?action=getAllLeads`);
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          console.log('[DEBUG] Raw leads data from Apps Script:', leadsData);
          if (Array.isArray(leadsData) && leadsData.length > 0) {
            setLeadsData(leadsData);
            leadsFetched = true;
          }
        }
      } catch (leadsError) {
        console.log('[DEBUG] Google Apps Script fetch failed:', leadsError);
      }
      // Fallback: create leads from calls
      if (!leadsFetched) {
        const fallbackLeads = createFallbackLeadsData(callsData.recordings || []);
        console.log('[DEBUG] Using fallback leads data:', fallbackLeads);
        setLeadsData(fallbackLeads);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (docId) => {
    setAnalyzingId(docId);
    try {
      await fetch('https://api.goyalhariyanacrm.in/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId })
      });
      await fetchData();
    } catch (err) {
      alert('Failed to analyze call.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const openCallDetails = (call) => {
    setSelectedCall(call);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCall(null);
  };

  // Get unique agents and projects for filter dropdowns
  const uniqueAgents = [...new Set(calls.map(call => getAgentName(call.executive)))];
  const uniqueProjects = [...new Set(calls.map(call => 
    leadsData.length > 0 
      ? getProjectNameFromLeads(call.customer, leadsData, call.refid)
      : getProjectName(call.formId, call.refid)
  ))];
  
  // Define main project list (normalized to lowercase for comparison)
  const mainProjects = [
    'orchid life',
    'orchid salisbury', 
    'orchid bloomsberry',
    'orchid platinum',
    'riviera uno'
  ];
  
  // Check if there are projects outside the main list
  const hasOtherProjects = uniqueProjects.some(project => 
    !mainProjects.includes((project || '').toLowerCase().trim())
  );

  // Filter calls based on selected filters
  const filteredCalls = calls.filter(call => {
    const agentName = getAgentName(call.executive);
    const projectName = leadsData.length > 0 
      ? getProjectNameFromLeads(call.customer, leadsData, call.refid)
      : getProjectName(call.formId, call.refid);
    
    // Normalize the project name for comparison
    const normalizedProjectName = (projectName || '').toLowerCase().trim();
    
    // Handle "Other" project filter
    let matchProject = true;
    if (filters.project) {
      if (filters.project === 'Other') {
        // Show calls from projects NOT in the main list
        matchProject = !mainProjects.includes(normalizedProjectName);
      } else {
        // Show calls from the specific selected project (case-insensitive)
        const normalizedFilterProject = filters.project.toLowerCase().trim();
        matchProject = normalizedProjectName === normalizedFilterProject;
      }
    }
    
    return (
      (!filters.agent || agentName === filters.agent) &&
      matchProject &&
      (!filters.status || call.status === filters.status)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-6xl">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
              <select
                value={filters.agent}
                onChange={(e) => setFilters(prev => ({ ...prev, agent: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Agents</option>
                {uniqueAgents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={filters.project}
                onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
                {hasOtherProjects && (
                  <option value="Other">Other</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Call Complete">Call Complete</option>
                <option value="Customer Busy">Customer Busy</option>
                <option value="No Answer">No Answer</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {filteredCalls.length} of {calls.length} calls
            </span>
            <button
              onClick={() => setFilters({ agent: '', project: '', status: '' })}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {filteredCalls.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">No call recordings found</div>
            <p className="text-gray-400">
              {calls.length === 0 
                ? 'Call recordings will appear here once MCUBE callbacks are received.'
                : 'No calls match the selected filters.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalls.map((call, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openCallDetails(call)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {getAgentName(call.executive)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {leadsData.length > 0 
                        ? getClientName(call.customer, leadsData)
                        : `Client: ${call.customer || 'N/A'}`
                      }
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {call.customer || 'N/A'}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {leadsData.length > 0 
                        ? getProjectNameFromLeads(call.customer, leadsData, call.refid)
                        : getProjectName(call.formId, call.refid)
                      }
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    call.status === 'Call Complete'
                      ? 'bg-green-100 text-green-800'
                      : call.status === 'Customer Busy'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {call.status || 'Unknown'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Answered:</strong> {formatDuration(Number(call.answeredtime))}</p>
                  <p><strong>Date:</strong> {call.receivedAt ? new Date(call.receivedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Call ID: {call.callid}</span>
                  <div className="flex space-x-2">
                    {call.analysis && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Analyzed
                      </span>
                    )}
                    {call.transcript && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Transcript
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Refresh Recordings
          </button>
        </div>

        {/* Debug Section - Remove this after fixing */}
        {leadsData.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Info</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Leads Data: {leadsData.length} leads fetched
            </p>
            {leadsData[0] && (
              <div className="text-xs text-yellow-600">
                <p><strong>Sample Lead Keys:</strong> {Object.keys(leadsData[0]).join(', ')}</p>
                <p><strong>Sample Lead:</strong> {JSON.stringify(leadsData[0], null, 2)}</p>
              </div>
            )}
            <p className="text-sm text-yellow-700 mt-2">
              Sample Call refid: {calls[0]?.refid || 'No refid'}
            </p>
          </div>
        )}
      </div>

      {/* Call Details Modal */}
      {showModal && selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Call Details
                  </h2>
                  <p className="text-gray-600">
                    {getAgentName(selectedCall.executive)} → {
                      leadsData.length > 0 
                        ? getClientName(selectedCall.customer, leadsData)
                        : selectedCall.customer
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCall.customer || 'N/A'}
                  </p>
                  <p className="text-blue-600 font-medium">
                    {leadsData.length > 0 
                      ? getProjectNameFromLeads(selectedCall.customer, leadsData, selectedCall.refid)
                      : getProjectName(selectedCall.formId, selectedCall.refid)
                    }
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Call Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Call ID:</strong> {selectedCall.callid}</p>
                    <p><strong>Status:</strong> {selectedCall.status}</p>
                    <p><strong>Start Time:</strong> {selectedCall.starttime}</p>
                    <p><strong>End Time:</strong> {selectedCall.endtime}</p>
                    <p><strong>Duration:</strong> {formatDuration(Number(selectedCall.duration))}</p>
                    <p><strong>Answered Time:</strong> {formatDuration(Number(selectedCall.answeredtime))}</p>
                    <p><strong>Received At:</strong> {selectedCall.receivedAt ? new Date(selectedCall.receivedAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recording</h3>
                  {selectedCall.filename ? (
                    <audio controls src={selectedCall.filename} className="w-full" />
                  ) : (
                    <p className="text-gray-500">No recording available</p>
                  )}
                </div>
              </div>

              {/* AI Analysis */}
              {selectedCall.analysis && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">AI Analysis</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><strong>Summary:</strong></p>
                        <p className="text-sm text-gray-600 mb-3">{selectedCall.analysis.summary}</p>
                        
                        <p className="text-sm">
                          <strong>Pitch Score:</strong>{' '}
                          <span style={{
                            color:
                              selectedCall.analysis.pitchScore >= 7 ? 'green' :
                              selectedCall.analysis.pitchScore <= 4 ? 'red' : 'orange',
                            fontWeight: 'bold'
                          }}>
                            {selectedCall.analysis.pitchScore}/10
                          </span>
                        </p>
                        
                        <p className="text-sm">
                          <strong>Customer Tone:</strong> {toneIcon(selectedCall.analysis.customerTone)} {selectedCall.analysis.customerTone}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm"><strong>Mistakes:</strong></p>
                        <p className="text-sm text-gray-600 mb-3">
                          {Array.isArray(selectedCall.analysis.mistakes) 
                            ? selectedCall.analysis.mistakes.join(', ') 
                            : selectedCall.analysis.mistakes}
                        </p>
                        
                        <p className="text-sm"><strong>Recommendation:</strong></p>
                        <p className="text-sm text-gray-600 mb-3">{selectedCall.analysis.recommendation}</p>
                        
                        <p className="text-sm"><strong>Follow Up:</strong></p>
                        <p className="text-sm text-gray-600">{selectedCall.analysis.followUpSuggestion}</p>
                      </div>
                    </div>
                    
                    <button
                      className="mt-4 px-4 py-2 bg-blue-200 text-blue-900 rounded text-sm hover:bg-blue-300"
                      onClick={() => {
                        const text = `Summary: ${selectedCall.analysis.summary}\nPitch Score: ${selectedCall.analysis.pitchScore}/10\nMistakes: ${Array.isArray(selectedCall.analysis.mistakes) ? selectedCall.analysis.mistakes.join(', ') : selectedCall.analysis.mistakes}\nCustomer Tone: ${selectedCall.analysis.customerTone}\nRecommendation: ${selectedCall.analysis.recommendation}\nFollow Up Suggestion: ${selectedCall.analysis.followUpSuggestion}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `call-analysis-${selectedCall.callid}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download Analysis
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript */}
              {selectedCall.transcript && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Call Transcript</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{selectedCall.transcript}</p>
                    <button
                      className="px-4 py-2 bg-blue-200 text-blue-900 rounded text-sm hover:bg-blue-300"
                      onClick={() => {
                        const blob = new Blob([selectedCall.transcript], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `call-transcript-${selectedCall.callid}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download Transcript
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Trigger */}
              {(!selectedCall.transcript || !selectedCall.analysis) && (
                <div className="text-center">
                  <button
                    onClick={() => triggerAnalysis(selectedCall.docId)}
                    className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
                    disabled={analyzingId === selectedCall.docId}
                  >
                    {analyzingId === selectedCall.docId ? 'Analyzing...' : 'Analyze Call'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
