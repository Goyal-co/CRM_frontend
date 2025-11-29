import { useState, useEffect } from "react";
import { formatDateForInput, formatDateForBackend } from "../utils/leadUtils";
import VideoLoader from "../components/VideoLoader";

export default function AutoLeadsSection({ email }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    leadId: null,
    currentProject: '',
    newProject: '',
    transferReason: ''
  });
  const [filters, setFilters] = useState({
    project: "",
    quality: "",
    source: "",
    freshOnly: false,
    siteVisit: "",
    siteVisitDone: "",
    date: "",
    startDate: "",
    endDate: "",
    useDateRange: false,
    showTransferred: false
  });

  const scriptUrl = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec`;

  const phoneBook = {
    "pratham.bng2002@gmail.com": "+919686602879",
    "avularudrasekharreddy@gmail.com": "+919014600977",
    "Presales6.bng@gmail.com": "+918147701373",
    "presales6.bng@gmail.com": "+918147701373",
    "Presales5.bng@gmail.com": "+918147701375",
    "presales5.bng@gmail.com": "+918147701375",
    "Presales8.bng@gmail.com": "+918971103745",
    "presales8.bng@gmail.com": "+918971103745",
    "skillnoha.lms@gmail.com": "+919014600977",
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${scriptUrl}?action=getLeads&email=${email}`)
      .then(res => res.json())
      .then(data => {
        setLeads(data.reverse());
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching leads:", error);
        alert("Failed to load leads. Please check your network and try again.");
        setLoading(false);
      });
  }, [email]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTransferProject = (lead) => {
    setTransferData({
      leadId: lead['Lead ID'],
      currentProject: lead['Project'],
      newProject: '',
      transferReason: ''
    });
    setShowTransferModal(true);
  };

  const executeTransfer = async () => {
    if (!transferData.newProject || !transferData.transferReason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      console.log('Starting project transfer with data:', transferData);

      const updatedLeads = leads.map(lead => {
        if (lead['Lead ID'] === transferData.leadId) {
          return {
            ...lead,
            'Old Project': lead['Old Project'] || lead['Project'],
            'Project': transferData.newProject,
            'Transfer Reason': transferData.transferReason,
            'Transferred': 'Yes',
            'Transfer Time': new Date().toISOString()
          };
        }
        return lead;
      });

      const leadToUpdate = updatedLeads.find(l => l['Lead ID'] === transferData.leadId);
      if (!leadToUpdate) throw new Error('Lead not found for update');

      const params = new URLSearchParams();
      params.append('updateLead', 'true');
      params.append('leadId', leadToUpdate['Lead ID']);
      params.append('sheetName', 'Leads');

      // Add all fields without double encoding
      Object.entries({
        'Old Project': leadToUpdate['Old Project'] || '',
        'Project': transferData.newProject,
        'Transfer Reason': transferData.transferReason,
        'Transferred': 'Yes',
        'Transfer Time': new Date().toISOString()
      }).forEach(([key, value]) => {
        params.append(key, value ?? '');
      });

      const response = await fetch(`${scriptUrl}?${params.toString()}`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to update lead');

      setLeads(updatedLeads);
      setShowTransferModal(false);
      alert('Project transferred successfully!');
    } catch (error) {
      console.error('Error transferring project:', error);
      alert('Failed to transfer project. Please try again.');
    }
  };


  const handleInputChange = (leadId, key, value) => {
    setLeads(prevLeads => {
      return prevLeads.map(lead => {
        if (lead['Lead ID'] === leadId) {
          const updatedLead = { ...lead, [key]: value };

          // Handle site visit date changes
          if (key === "Site Visit Date") {
            // Format the date for storage if it's not empty
            updatedLead[key] = value ? formatDateForBackend(value) : "";
          }

          // Handle site visit done date changes
          if (key === "Site Visit Done Date") {
            // Format the date for storage if it's not empty
            updatedLead[key] = value ? formatDateForBackend(value) : "";
          }

          // Clear site visit date if site visit is set to "No"
          if (key === "Site Visit?" && value === "No") {
            updatedLead["Site Visit Date"] = "";
          }

          // Clear site visit done date if site visit done is set to "No"
          if (key === "Site Visit Done?" && value === "No") {
            updatedLead["Site Visit Done Date"] = "";
          }

          // If site visit is set to "Yes" and no date is set, set a default date (tomorrow)
          if (key === "Site Visit?" && value === "Yes" && !updatedLead["Site Visit Date"]) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            updatedLead["Site Visit Date"] = formatDateForBackend(tomorrow);
          }

          // If site visit done is set to "Yes" and no date is set, set a default date (today)
          if (key === "Site Visit Done?" && value === "Yes" && !updatedLead["Site Visit Done Date"]) {
            const today = new Date();
            updatedLead["Site Visit Done Date"] = formatDateForBackend(today);
          }

          return updatedLead;
        }
        return lead;
      });
    });
  };

  const updateLead = async (lead) => {
    try {
      // Prepare URL parameters for the update
      const params = new URLSearchParams();

      // Add required parameters
      params.append('updateLead', 'true');
      params.append('leadId', lead["Lead ID"]);
      params.append('sheetName', 'Leads');

      // Add all fields as URL parameters
      const fields = [
        { key: 'Called?', value: lead["Called?"] || '' },
        { key: 'Site Visit?', value: lead["Site Visit?"] || 'No' },
        { key: 'Site Visit Done?', value: lead["Site Visit Done?"] || 'No' },
        { key: 'Booked?', value: lead["Booked?"] || '' },
        { key: 'Lead Quality', value: lead["Lead Quality"] || '' },
        { key: 'Overall Quality', value: lead["Overall Quality"] || '' },
        { key: 'Old Project', value: lead["Old Project"] || '' },
        { key: 'Transfer Reason', value: lead["Transfer Reason"] || '' },
        { key: 'Transferred', value: lead["Transferred"] || '' },
        { key: 'Transfer Time', value: lead["Transfer Time"] || '' },
        { key: 'Project', value: lead["Project"] || '' }
      ];

      // Add feedback fields
      for (let i = 1; i <= 5; i++) {
        const feedbackKey = `Feedback ${i}`;
        fields.push({
          key: feedbackKey,
          value: lead[feedbackKey] || ''
        });
      }

      // Handle site visit date - format it properly for the backend
      let dateValue = '';
      if (lead["Site Visit?"] === 'Yes' && lead["Site Visit Date"]) {
        dateValue = formatDateForBackend(lead["Site Visit Date"]);
        console.log('Formatted site visit date for backend:', dateValue);
      }

      // Handle site visit done date - format it properly for the backend
      let doneDateValue = '';
      if (lead["Site Visit Done?"] === 'Yes' && lead["Site Visit Done Date"]) {
        doneDateValue = formatDateForBackend(lead["Site Visit Done Date"]);
        console.log('Formatted site visit done date for backend:', doneDateValue);
      }

      // Always include the Site Visit Date field, even if empty
      fields.push({
        key: 'Site Visit Date',
        value: dateValue
      });

      // Always include the Site Visit Done Date field, even if empty
      fields.push({
        key: 'Site Visit Done Date',
        value: doneDateValue
      });

      // Add all fields to URL parameters
      fields.forEach(field => {
        if (field.value !== undefined && field.value !== null) {
          // Encode the field name and value to handle special characters
          params.append(field.key, field.value ?? '');
        }
      });

      console.log('Sending update with params:', params.toString());

      // Make the GET request with all parameters in the URL
      const response = await fetch(`${scriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Parse the response
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log('Update result:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.success) {
        throw new Error('Update failed: ' + (result.message || 'Unknown error'));
      }

      // Refresh the leads after successful update
      const refreshRes = await fetch(`${scriptUrl}?action=getLeads&email=${email}`);
      const newLeads = await refreshRes.json();
      setLeads(newLeads.reverse());

      alert('Lead updated successfully!');
      return result;
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(`Failed to update lead: ${error.message}`);
      throw error;
    }
  };

  const handleCallNow = async (lead) => {
    const agentNumber = phoneBook[email?.trim().toLowerCase()] || "+911234567890";
    let customerNumber = lead.Phone;
    const leadId = lead["Lead ID"];

    // Ensure customer number is in +91 format
    if (!/^(\+91\d{10}|91\d{10}|\d{10})$/.test(customerNumber)) {
      alert("Customer phone number must be in +91XXXXXXXXXX, 91XXXXXXXXXX, or 10 digit format. Current: " + customerNumber);
      return;
    }
    // Add + if missing
    if (/^91\d{10}$/.test(customerNumber)) {
      customerNumber = "+" + customerNumber;
    } else if (/^\d{10}$/.test(customerNumber)) {
      customerNumber = "+91" + customerNumber;
    }

    try {
      console.log("Initiating MCUBE call with:", { agentNumber, customerNumber, leadId });
      const url = `https://api.goyalhariyanacrm.in/api/trigger-call?agent=${encodeURIComponent(agentNumber)}&customer=${encodeURIComponent(customerNumber)}&leadId=${encodeURIComponent(leadId)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("MCUBE API response:", data);

      if (data.success) {
        const callId = data.mcubeResponse?.callid ? `\nCall ID: ${data.mcubeResponse.callid}` : '';
        alert(`📞 ${data.message}${callId}\n\nNote: ${data.note || 'Call initiated successfully!'}`);

        // Store last call info for status update and recording download
        window.lastCallId = data.mcubeResponse?.callid || null;
        window.lastAgentNumber = agentNumber;
        window.lastCustomerNumber = customerNumber;

        // Show manual status update option after a delay
        setTimeout(() => {
          const shouldUpdate = confirm("Did you complete the call? Would you like to update the call status manually?");
          if (shouldUpdate) {
            updateCallStatusManually(leadId);
          }
        }, 5000); // 5 seconds delay
      } else {
        alert(`Call failed: ${data.error || data.message || 'Unknown error'}. Check server logs for details.\nDebug: ${JSON.stringify(data.debug)}`);
      }
    } catch (error) {
      console.error("MCUBE call error:", {
        message: error.message,
        stack: error.stack,
        agentNumber,
        customerNumber,
        leadId,
        email,
        url
      });
      if (error.message.includes("Failed to fetch")) {
        alert("Error: Unable to connect to the server. Ensure the server is running on https://api.goyalhariyanacrm.in/  and check your network.");
      } else {
        alert(`Call failed: ${error.message}. Please try again or contact support.`);
      }
    }
  };

  const downloadRecordingToFirebase = async (callId, leadId, agent, customer) => {
    try {
      console.log("Downloading recording to Firebase:", { callId, leadId, agent, customer });

      const res = await fetch(`${API_URL}/api/download-recording`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          callId,
          leadId,
          agent,
          customer
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Download response:", data);

      if (data.success) {
        alert(`✅ Recording downloaded successfully!\n\nFirebase URL: ${data.firebaseUrl}\n\nYou can now view it in the admin panel.`);
      } else {
        alert(`❌ Download failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}. Please try again later.`);
    }
  };

  const updateCallStatusManually = async (leadId) => {
    const status = prompt("Enter call status (e.g., 'Connected', 'Not Answered', 'Busy', 'Wrong Number', 'Call complete', 'answered'):");
    if (!status) return;

    const notes = prompt("Enter any additional notes (optional):");

    // Get callId, agent, and customer from the last call (if available)
    const lastCallId = window.lastCallId || null;
    const agent = window.lastAgentNumber || null;
    const customer = window.lastCustomerNumber || null;

    try {
      const res = await fetch("https://api.goyalhariyanacrm.in/api/update-call-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          leadId,
          status,
          notes,
          callId: lastCallId,
          agent,
          customer
        })
      });

      if (res.ok) {
        alert("✅ Call status updated successfully!");
        // Refresh leads to show updated status
        window.location.reload();
      } else {
        alert("Failed to update call status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating call status:", error);
      alert("Error updating call status. Please try again.");
    }
  };

  const getStatusText = (lead) => {
    if (!lead["Called?"]) return "Not Called";
    if (lead["Booked?"] === "Yes") return "Booked";
    if (lead["Site Visit?"] === "Yes") return "Visited";
    return "In Process";
  };

  // Get unique projects for dropdown, including "Other" if there are non-main projects
  const allProjects = [...new Set(leads.map(l => l["Project"]))];
  const mainProjects = [
    'orchid life',
    'orchid salisbury',
    'orchid bloomsberry',
    'orchid platinum',
    'riviera uno'
  ];

  const handleDownloadResponse = async (res) => {
    try {
      const data = await res.json();
      console.log("Download response:", data);

      if (data.success) {
        alert(`✅ Recording downloaded successfully!\n\nFirebase URL: ${data.firebaseUrl}\n\nYou can now view it in the admin panel.`);
      } else {
        alert(`❌ Download failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}. Please try again later.`);
    }
  };

  const hasOtherProjects = allProjects.some(project =>
    project && !mainProjects.includes(project.toLowerCase().trim())
  );

  const filteredLeads = leads.filter(lead => {
    // Safely handle null/undefined lead
    if (!lead) return false;

    // Search filter - handle empty search term case
    if (searchTerm && searchTerm.trim() !== '') {
      try {
        const searchLower = searchTerm.toLowerCase().trim();
        const name = String(lead["Name"] || '').toLowerCase();
        const phone = String(lead["Phone"] || '');
        const project = String(lead["Project"] || '').toLowerCase();
        const source = String(lead["Source"] || '').toLowerCase();
        const originalProject = String(lead["Old Project"] || lead["Original Project"] || '').toLowerCase();
        const transferReason = String(lead["Transfer Reason"] || '').toLowerCase();

        const matches = [
          name.includes(searchLower),
          phone.includes(searchTerm),
          project.includes(searchLower),
          source.includes(searchLower),
          originalProject.includes(searchLower),
          transferReason.includes(searchLower)
        ];

        // If no matches found, exclude this lead
        if (!matches.some(match => match === true)) {
          return false;
        }
      } catch (error) {
        console.error('Error processing search:', error);
        // If there's an error with search, show all leads to prevent white screen
        return true;
      }
    }

    // Date filter - handle both single date and date range using Assigned Time
    if (filters.date || (filters.startDate || filters.endDate)) {
      // Get the lead's assigned time - handle both 'Assigned Time' and 'Assigned_Time' field names
      const assignedTimeStr = lead['Assigned Time'] || lead['Assigned_Time'] || lead['Timestamp'] || lead['Date Added'] || '';

      // Skip if no assigned time is available and we're filtering by date
      if (!assignedTimeStr) return false;

      // Parse the assigned time - handle different date formats
      let leadDate;
      if (typeof assignedTimeStr === 'string' && assignedTimeStr.includes('T')) {
        // Handle ISO format (2023-01-01T00:00:00.000Z)
        leadDate = new Date(assignedTimeStr);
      } else if (typeof assignedTimeStr === 'string' && assignedTimeStr.includes('/')) {
        // Handle date strings with slashes (MM/DD/YYYY or DD/MM/YYYY)
        const parts = assignedTimeStr.split(/[/\s:]+/);
        if (parts.length >= 3) {
          // Try to handle different date formats
          if (parts[0].length === 4) {
            // YYYY/MM/DD format
            leadDate = new Date(assignedTimeStr);
          } else {
            // Assume MM/DD/YYYY or DD/MM/YYYY
            const day = parseInt(parts[1], 10);
            const month = parseInt(parts[0], 10) - 1; // months are 0-based
            const year = parseInt(parts[2], 10);
            leadDate = new Date(year, month, day);
          }
        }
      } else if (typeof assignedTimeStr === 'number') {
        // Handle timestamps
        leadDate = new Date(assignedTimeStr);
      } else {
        // Last resort - try to parse as is
        leadDate = new Date(assignedTimeStr);
      }

      // Check if the date is valid
      if (isNaN(leadDate.getTime())) {
        // If we can't parse the date, only include if we're not filtering by date
        return !filters.date && !(filters.startDate || filters.endDate);
      }

      // For single date filter
      if (filters.date) {
        const filterDate = new Date(filters.date);
        if (isNaN(filterDate.getTime())) {
          return true; // If filter date is invalid, don't filter by date
        }

        // Compare dates (ignoring time)
        const leadDateOnly = leadDate.toISOString().split('T')[0];
        const filterDateOnly = filterDate.toISOString().split('T')[0];

        if (leadDateOnly !== filterDateOnly) {
          return false;
        }
      }

      // For date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date(0); // Beginning of time
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date(); // Now

        // Set time to start/end of day for proper range comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if ((filters.startDate && leadDate < startDate) || (filters.endDate && leadDate > endDate)) {
          return false;
        }
      }
    }

    // Project filter
    let matchProject = true;
    if (filters.project) {
      const normalizedLeadProject = (lead["Project"] || '').toString().toLowerCase().trim();
      const originalProject = (lead["Old Project"] || lead["Original Project"] || '').toString().toLowerCase().trim();

      if (filters.project === 'Transferred Projects') {
        // Show only transferred projects (those with an Original Project value)
        matchProject = originalProject !== '' && originalProject !== normalizedLeadProject;
      } else if (filters.project === 'Other') {
        // Show leads from projects NOT in the main list
        matchProject = !mainProjects.includes(normalizedLeadProject);
      } else {
        // Show leads from the specific selected project (case-insensitive)
        const normalizedFilterProject = filters.project.toLowerCase().trim();
        matchProject = normalizedLeadProject === normalizedFilterProject ||
          originalProject === normalizedFilterProject;
      }

      if (!matchProject) {
        console.log('Lead filtered out by project filter:', {
          leadId: lead['Lead ID'],
          project: lead['Project'],
          originalProject: lead['Original Project'],
          filter: filters.project,
          matched: matchProject
        });
        return false;
      }
    }

    const matchQuality = filters.quality ? lead["Lead Quality"] === filters.quality : true;
    const matchSource = filters.source ? lead["Source"] === filters.source : true;
    const matchSiteVisit = filters.siteVisit ? lead["Site Visit?"] === filters.siteVisit : true;
    const matchSiteVisitDone = filters.siteVisitDone ? lead["Site Visit Done?"] === filters.siteVisitDone : true;
    const matchFresh = filters.freshOnly ? !lead["Called?"] : true;

    return matchQuality && matchSource && matchSiteVisit && matchSiteVisitDone && matchFresh;
  });

  // Calculate quality counts
  const qualityCounts = { WIP: 0, Warm: 0, Cold: 0, RNR: 0, Junk: 0, Invalid: 0 };
  leads.forEach(l => {
    if (l["Lead Quality"] === "WIP") qualityCounts.WIP++;
    else if (l["Lead Quality"] === "Warm") qualityCounts.Warm++;
    else if (l["Lead Quality"] === "Cold") qualityCounts.Cold++;
    else if (l["Lead Quality"] === "RNR") qualityCounts.RNR++;
    else if (l["Lead Quality"] === "Junk") qualityCounts.Junk++;
    else if (l["Lead Quality"] === "Invalid") qualityCounts.Invalid++;
  });

  // Show video loader when loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <VideoLoader
          message="Loading leads..."
          size="large"
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Filters Sidebar */}
      <div className="w-1/4 p-4 bg-white rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Filter Leads</h3>
        <div className="mb-4 border-b pb-3">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Date Filter:</span>
            <button
              onClick={() => handleFilterChange("useDateRange", !filters.useDateRange)}
              className={`text-xs px-2 py-1 rounded ${!filters.useDateRange ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
            >
              Single Date
            </button>
            <button
              onClick={() => handleFilterChange("useDateRange", !filters.useDateRange)}
              className={`text-xs px-2 py-1 ml-1 rounded ${filters.useDateRange ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
            >
              Date Range
            </button>
          </div>

          {!filters.useDateRange ? (
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={e => {
                  handleFilterChange("date", e.target.value);
                  // Clear date range when selecting single date
                  if (e.target.value) {
                    handleFilterChange("startDate", "");
                    handleFilterChange("endDate", "");
                  }
                }}
                className="w-full p-2 border rounded"
              />
              {filters.date && (
                <button
                  onClick={() => {
                    handleFilterChange("date", "");
                  }}
                  className="text-xs text-blue-600 mt-1 hover:underline"
                >
                  Clear date
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  max={filters.endDate || new Date().toISOString().split('T')[0]}
                  onChange={e => {
                    handleFilterChange("startDate", e.target.value);
                    // Clear single date when using date range
                    if (e.target.value) {
                      handleFilterChange("date", "");
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => {
                    handleFilterChange("endDate", e.target.value);
                    // Clear single date when using date range
                    if (e.target.value) {
                      handleFilterChange("date", "");
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              {(filters.startDate || filters.endDate) && (
                <button
                  onClick={() => {
                    handleFilterChange("startDate", "");
                    handleFilterChange("endDate", "");
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear date range
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Project</span>
            {filters.showTransferred && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Showing Transferred
              </span>
            )}
          </div>
          <select
            onChange={e => handleFilterChange('project', e.target.value)}
            className="w-full p-2 border rounded"
            value={filters.project || ''}
          >
            <option value="">All Projects</option>
            <option value="Transferred Projects">Transferred Projects</option>
            {hasOtherProjects && <option value="Other">Other Projects</option>}
            {Array.from(new Map(
              // Get all unique projects (current and original)
              [
                ...leads.map(l => l['Project']),
                ...leads
                  .filter(l => l['Original Project'] && l['Original Project'] !== l['Project'])
                  .map(l => l['Original Project'])
              ]
                .filter(Boolean) // Remove null/undefined
                .map(p => [p, p]) // Use project name as both key and value
            ).values())
              .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
              .map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
          </select>
        </div>
        <select onChange={e => handleFilterChange("quality", e.target.value)} className="w-full mb-3 p-2 border rounded">
          <option value="">All Qualities</option>
          <option value="WIP">WIP</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
          <option value="RNR">RNR (Ring No Reply)</option>
          <option value="Junk">Junk</option>
          <option value="Invalid">Invalid</option>
        </select>
        <select onChange={e => handleFilterChange("source", e.target.value)} className="w-full mb-3 p-2 border rounded">
          <option value="">Source</option>
          <option value="Facebook">Facebook</option>
          <option value="Website">Website</option>
          <option value="MagicBricks">MagicBricks</option>
        </select>
        <select onChange={e => handleFilterChange("siteVisit", e.target.value)} className="w-full mb-3 p-2 border rounded">
          <option value="">Site Visit?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <select onChange={e => handleFilterChange("siteVisitDone", e.target.value)} className="w-full mb-3 p-2 border rounded">
          <option value="">Site Visit Done?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <label className="flex items-center mt-2">
          <input type="checkbox" onChange={e => handleFilterChange("freshOnly", e.target.checked)} className="mr-2" />
          Fresh Leads Only
        </label>
      </div>

      {/* Lead Cards Section */}
      <div className="flex-1 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Auto Leads</h2>
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search by name, phone, project, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-sm">WIP: {qualityCounts.WIP}</div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-bold text-sm">Warm: {qualityCounts.Warm}</div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-sm">Cold: {qualityCounts.Cold}</div>
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded font-bold text-sm">RNR: {qualityCounts.RNR}</div>
          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold text-sm">Junk: {qualityCounts.Junk}</div>
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-sm">Invalid: {qualityCounts.Invalid}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead, index) => {
            const isExpanded = expandedIndex === index;
            const qualityColor = lead["Lead Quality"] === "WIP"
              ? "bg-red-500"
              : lead["Lead Quality"] === "Warm"
                ? "bg-yellow-400"
                : lead["Lead Quality"] === "Junk"
                  ? "bg-gray-400"
                  : lead["Lead Quality"] === "Invalid"
                    ? "bg-red-400"
                    : "bg-blue-500";

            return (
              <div key={index} className="bg-white p-4 rounded-xl shadow-md relative">
                {/* Lead Source Badge */}
                {lead["Source"] && (
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {lead["Source"]}
                  </div>
                )}

                {/* Card Summary */}
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
                  <div className="pr-4">
                    <h4 className="font-semibold text-lg">{lead["Name"]}</h4>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-500">
                          {lead["Old Project"] || lead["Original Project"] ? (
                            <span className="font-medium">
                              <span className="line-through text-gray-400">{lead["Old Project"] || lead["Original Project"]}</span>
                              <span className="mx-1">→</span>
                              <span className="text-blue-600">{lead["Project"]}</span>
                            </span>
                          ) : (
                            lead["Project"]
                          )}
                        </p>
                        {(lead["Old Project"] || lead["Original Project"]) && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            Transferred
                          </span>
                        )}
                      </div>
                      {lead["Transfer Reason"] && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-1 px-2 rounded">
                          <span className="font-medium">Reason:</span> {lead["Transfer Reason"]}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-blue-600 font-medium">📱 {lead["Phone"] || 'No phone number'}</p>

                    {/* Meta Form Fields Display */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {lead["Size"] && (
                        <div className="bg-blue-50 p-1 px-2 rounded">
                          <span className="font-medium text-blue-700">Size:</span> {lead["Size"]}
                        </div>
                      )}
                      {lead["Budget"] && (
                        <div className="bg-green-50 p-1 px-2 rounded">
                          <span className="font-medium text-green-700">Budget:</span> {lead["Budget"]}
                        </div>
                      )}
                      {lead["Purpose"] && (
                        <div className="bg-purple-50 p-1 px-2 rounded">
                          <span className="font-medium text-purple-700">Purpose:</span> {lead["Purpose"]}
                        </div>
                      )}
                      {lead["Priority"] && (
                        <div className="bg-orange-50 p-1 px-2 rounded">
                          <span className="font-medium text-orange-700">Priority:</span> {lead["Priority"]}
                        </div>
                      )}
                      {lead["Work Location"] && (
                        <div className="bg-indigo-50 p-1 px-2 rounded col-span-2">
                          <span className="font-medium text-indigo-700">Work Location:</span> {lead["Work Location"]}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-white text-xs px-2 py-1 rounded ${qualityColor}`}>
                        {lead["Lead Quality"]}
                      </span>
                      <span className="text-xs text-gray-600">{getStatusText(lead)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallNow(lead);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Call Now
                  </button>
                </div>
                {/* Expanded Inputs */}
                {isExpanded && (
                  <div className="mt-4 space-y-2 text-sm">
                    {/* Transfer Information - Show if this is a transferred lead */}
                    {/* Transfer Information - Show if this is a transferred lead */}
                    {(lead["Old Project"] || lead["Original Project"]) && (
                      <div className="bg-yellow-50 p-3 rounded-lg mb-3 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <h4 className="font-semibold text-yellow-800 text-sm">Transfer Information</h4>
                        </div>
                        <div className="bg-white p-2 rounded border border-yellow-100 text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <p className="font-medium text-gray-600">From Project</p>
                              <p className="text-gray-800">{lead["Old Project"] || lead["Original Project"]}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">To Project</p>
                              <p className="text-blue-600 font-medium">{lead["Project"]}</p>
                            </div>
                          </div>
                          {lead["Transfer Reason"] && (
                            <div className="mt-1">
                              <p className="font-medium text-gray-600">Reason</p>
                              <p className="text-gray-800">{lead["Transfer Reason"]}</p>
                            </div>
                          )}
                          {(lead["Transfer Time"] || lead["Transfer Date"]) && (
                            <p><span className="font-medium">Date:</span> {new Date(lead["Transfer Time"] || lead["Transfer Date"]).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Detailed Lead Info */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                      <h4 className="font-semibold text-gray-700 text-sm mb-2">Lead Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-medium text-gray-600">Lead ID:</span> {lead["Lead ID"]}</div>
                        <div><span className="font-medium text-gray-600">Email:</span> {lead["Email"] || "-"}</div>
                        <div><span className="font-medium text-gray-600">City:</span> {lead["City"] || "-"}</div>
                        <div><span className="font-medium text-gray-600">Assigned To:</span> {lead["Assigned To"] || "-"}</div>
                        <div><span className="font-medium text-gray-600">Assigned Time:</span> {lead["Assigned Time"] ? new Date(lead["Assigned Time"]).toLocaleString() : "-"}</div>
                        <div><span className="font-medium text-gray-600">Call Time:</span> {lead["Call Time"] ? new Date(lead["Call Time"]).toLocaleString() : "-"}</div>
                        <div><span className="font-medium text-gray-600">Call Delay:</span> {lead["Call Delay?"] || "-"}</div>
                      </div>
                    </div>

                    {/* Communication Status */}
                    <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 text-sm mb-2">Communication Status</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-medium text-gray-600">Welcome Sent:</span> {lead["Welcome Sent"] || lead["Welcome Mail Sent"] || "-"}</div>
                        <div><span className="font-medium text-gray-600">SV Schedule Sent:</span> {lead["SV. Schedule Mail Sent"] || "-"}</div>
                        <div><span className="font-medium text-gray-600">SV WhatsApp:</span> {lead["SV WhatsApp Sent"] || "-"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={lead["Called?"] || ""}
                        onChange={(e) => handleInputChange(lead['Lead ID'], "Called?", e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">Called?</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="col-span-2">
                        <select
                          value={lead["Site Visit?"] || ""}
                          onChange={(e) => {
                            const leadId = lead['Lead ID'];
                            handleInputChange(leadId, "Site Visit?", e.target.value);
                            // Clear site visit date when changing from Yes to No/empty
                            if (e.target.value !== "Yes") {
                              handleInputChange(leadId, "Site Visit Date", "");
                            } else if (e.target.value === "Yes" && !lead["Site Visit Date"]) {
                              // Set default to today if switching to Yes and no date set
                              handleInputChange(leadId, "Site Visit Date", new Date().toISOString().split('T')[0]);
                            }
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Site Visit?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {lead["Site Visit?"] === "Yes" && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Site Visit Date</label>
                            <input
                              type="date"
                              value={formatDateForInput(lead["Site Visit Date"])}
                              min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                const leadId = lead['Lead ID'];
                                const today = new Date();
                                const tomorrow = new Date(today);
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const minDate = tomorrow.toISOString().split('T')[0];

                                if (selectedDate >= minDate) {
                                  handleInputChange(leadId, "Site Visit Date", selectedDate);
                                } else {
                                  // Set to tomorrow's date if an invalid date is selected
                                  handleInputChange(leadId, "Site Visit Date", minDate);
                                  e.target.value = minDate;
                                  alert('Please select a future date for site visit');
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                              required
                            />
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <select
                          value={lead["Site Visit Done?"] || ""}
                          onChange={(e) => {
                            const leadId = lead['Lead ID'];
                            handleInputChange(leadId, "Site Visit Done?", e.target.value);
                            // Clear site visit done date when changing from Yes to No/empty
                            if (e.target.value !== "Yes") {
                              handleInputChange(leadId, "Site Visit Done Date", "");
                            } else if (e.target.value === "Yes" && !lead["Site Visit Done Date"]) {
                              // Set default to today if switching to Yes and no date set
                              handleInputChange(leadId, "Site Visit Done Date", new Date().toISOString().split('T')[0]);
                            }
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Site Visit Done?</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {lead["Site Visit Done?"] === "Yes" && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Site Visit Done Date</label>
                            <input
                              type="date"
                              value={formatDateForInput(lead["Site Visit Done Date"])}
                              max={new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                const leadId = lead['Lead ID'];
                                const today = new Date().toISOString().split('T')[0];

                                if (selectedDate <= today) {
                                  handleInputChange(leadId, "Site Visit Done Date", selectedDate);
                                } else {
                                  // Set to today's date if a future date is selected
                                  handleInputChange(leadId, "Site Visit Done Date", today);
                                  e.target.value = today;
                                  alert('Please select today or a past date for site visit done');
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                              required
                            />
                          </div>
                        )}
                      </div>
                      <select
                        value={lead["Booked?"] || ""}
                        onChange={(e) => handleInputChange(lead['Lead ID'], "Booked?", e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">Booked?</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <select
                        value={lead["Lead Quality"] || ""}
                        onChange={(e) => handleInputChange(lead['Lead ID'], "Lead Quality", e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">Quality</option>
                        <option value="WIP">WIP</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                        <option value="RNR">RNR (Ring No Reply)</option>
                        <option value="Junk">Junk</option>
                        <option value="Invalid">Invalid</option>
                      </select>
                      <select
                        value={lead["Overall Quality"] || ""}
                        onChange={(e) => handleInputChange(lead['Lead ID'], "Overall Quality", e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">Overall Quality</option>
                        <option value="Valid">Valid</option>
                        <option value="Invalid">Invalid</option>
                        <option value="In both">In both</option>
                      </select>

                      {/* Meta Form Fields - Editable */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Size</label>
                          <input
                            type="text"
                            placeholder="Preferred Size"
                            value={lead["Size"] || ""}
                            onChange={(e) => handleInputChange(lead['Lead ID'], "Size", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Budget</label>
                          <input
                            type="text"
                            placeholder="Budget Range"
                            value={lead["Budget"] || ""}
                            onChange={(e) => handleInputChange(lead['Lead ID'], "Budget", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Purpose</label>
                          <input
                            type="text"
                            placeholder="Purpose"
                            value={lead["Purpose"] || ""}
                            onChange={(e) => handleInputChange(lead['Lead ID'], "Purpose", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Priority</label>
                          <input
                            type="text"
                            placeholder="Priority"
                            value={lead["Priority"] || ""}
                            onChange={(e) => handleInputChange(lead['Lead ID'], "Priority", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Work Location</label>
                          <input
                            type="text"
                            placeholder="Work Location"
                            value={lead["Work Location"] || ""}
                            onChange={(e) => handleInputChange(lead['Lead ID'], "Work Location", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleTransferProject(lead)}
                        className="mt-2 w-full bg-yellow-100 text-yellow-800 p-2 rounded hover:bg-yellow-200 text-sm"
                      >
                        Transfer Project
                      </button>
                    </div>
                    {lead['Original Project'] && (
                      <div className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded">
                        <span className="font-semibold">Transferred from:</span> {lead['Original Project']}
                        {lead['Transfer Reason'] && (
                          <div className="mt-1">
                            <span className="font-semibold">Reason:</span> {lead['Transfer Reason']}
                          </div>
                        )}
                      </div>
                    )}
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="space-y-1">
                        <input
                          type="text"
                          placeholder={`Feedback ${n}`}
                          value={lead[`Feedback ${n}`] || ""}
                          onChange={(e) => handleInputChange(lead['Lead ID'], `Feedback ${n}`, e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        {lead[`Time ${n}`] && (
                          <div className="text-xs text-gray-500 text-right">
                            {new Date(lead[`Time ${n}`]).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateLead(lead)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      ✅ Update
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer Project Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Transfer Project</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Project
              </label>
              <input
                type="text"
                value={transferData.currentProject}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Project
              </label>
              <select
                value={transferData.newProject}
                onChange={(e) => setTransferData(prev => ({ ...prev, newProject: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a project</option>
                {Array.from(new Map(leads
                  .map(l => l['Project'])
                  .filter(p => p) // Remove null/undefined
                  .map(p => [p.toLowerCase(), p]) // Use lowercase as key to dedupe
                  .values() // Get the first occurrence of each case variation
                ).values())
                  .filter(project => project !== transferData.currentProject) // Exclude current project
                  .map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Transfer
              </label>
              <textarea
                value={transferData.transferReason}
                onChange={(e) => setTransferData(prev => ({ ...prev, transferReason: e.target.value }))}
                placeholder="Enter the reason for transferring this project..."
                className="w-full p-2 border rounded h-24"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={executeTransfer}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
