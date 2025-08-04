import { useState, useEffect } from "react";

export default function AutoLeadsSection({ email }) {
  const [leads, setLeads] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    project: "",
    quality: "",
    source: "",
    freshOnly: false,
    siteVisit: "",
    date: "",
    startDate: "",
    endDate: "",
    useDateRange: false
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
    fetch(`${scriptUrl}?action=getLeads&email=${email}`)
      .then(res => res.json())
      .then(data => setLeads(data.reverse()))
      .catch(error => {
        console.error("Error fetching leads:", error);
        alert("Failed to load leads. Please check your network and try again.");
      });
  }, [email]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (index, key, value) => {
    const updated = [...leads];
    updated[index][key] = value;
    setLeads(updated);
  };

  const updateLead = async (lead) => {
    const params = new URLSearchParams({
      action: "updateLead",
      leadId: lead["Lead ID"],
      called: lead["Called?"] || "",
      siteVisit: lead["Site Visit?"] || "",
      booked: lead["Booked?"] || "",
      quality: lead["Lead Quality"] || "",
      feedback1: lead["Feedback 1"] || "",
      feedback2: lead["Feedback 2"] || "",
      feedback3: lead["Feedback 3"] || "",
      feedback4: lead["Feedback 4"] || "",
      feedback5: lead["Feedback 5"] || ""
    });

    try {
      await fetch(`${scriptUrl}?${params.toString()}`);
      alert("Lead updated!");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
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
  const hasOtherProjects = allProjects.some(project => 
    project && !mainProjects.includes(project.toLowerCase().trim())
  );

  const filteredLeads = leads.filter(lead => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = lead["Name"]?.toString().toLowerCase().includes(searchLower) || false;
      const phoneMatch = lead["Phone"]?.toString().includes(searchTerm) || false;
      const projectMatch = lead["Project"]?.toString().toLowerCase().includes(searchLower) || false;
      const sourceMatch = lead["Source"]?.toString().toLowerCase().includes(searchLower) || false;
      
      if (!(nameMatch || phoneMatch || projectMatch || sourceMatch)) {
        return false; // Skip if search doesn't match
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
      if (filters.project === 'Other') {
        // Show leads from projects NOT in the main list
        matchProject = !mainProjects.includes(normalizedLeadProject);
      } else {
        // Show leads from the specific selected project (case-insensitive)
        const normalizedFilterProject = filters.project.toLowerCase().trim();
        matchProject = normalizedLeadProject === normalizedFilterProject;
      }
      if (!matchProject) return false;
    }
    
    const matchQuality = filters.quality ? lead["Lead Quality"] === filters.quality : true;
    const matchSource = filters.source ? lead["Source"] === filters.source : true;
    const matchSiteVisit = filters.siteVisit ? lead["Site Visit?"] === filters.siteVisit : true;
    const matchFresh = filters.freshOnly ? !lead["Called?"] : true;
    
    return matchQuality && matchSource && matchSiteVisit && matchFresh;
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
        <select onChange={e => handleFilterChange("project", e.target.value)} className="w-full mb-3 p-2 border rounded">
          <option value="">All Projects</option>
          {hasOtherProjects && <option value="Other">Other Projects</option>}
          {[...new Set(leads.map(l => l["Project"]))].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
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
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              {/* Card Summary */}
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
                <div>
                  <h4 className="font-semibold text-lg">{lead["Name"]}</h4>
                  <p className="text-sm text-gray-500">{lead["Project"]}</p>
                  <p className="text-sm text-blue-600 font-medium">📱 {lead["Phone"] || 'No phone number'}</p>
                  <div className="flex items-center gap-2 mt-1">
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
                  <div className="grid grid-cols-2 gap-2">
                    <select value={lead["Called?"] || ""} onChange={(e) => handleInputChange(index, "Called?", e.target.value)} className="p-2 border rounded">
                      <option value="">Called?</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <select value={lead["Site Visit?"] || ""} onChange={(e) => handleInputChange(index, "Site Visit?", e.target.value)} className="p-2 border rounded">
                      <option value="">Site Visit?</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <select value={lead["Booked?"] || ""} onChange={(e) => handleInputChange(index, "Booked?", e.target.value)} className="p-2 border rounded">
                      <option value="">Booked?</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <select value={lead["Lead Quality"] || ""} onChange={(e) => handleInputChange(index, "Lead Quality", e.target.value)} className="p-2 border rounded">
                      <option value="">Quality</option>
                      <option value="WIP">WIP</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                      <option value="RNR">RNR (Ring No Reply)</option>
                      <option value="Junk">Junk</option>
                      <option value="Invalid">Invalid</option>
                    </select>
                  </div>
                  {[1, 2, 3, 4, 5].map(n => (
                    <input
                      key={n}
                      type="text"
                      placeholder={`Feedback ${n}`}
                      value={lead[`Feedback ${n}`] || ""}
                      onChange={(e) => handleInputChange(index, `Feedback ${n}`, e.target.value)}
                      className="w-full p-2 border rounded"
                    />
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
    </div>
  );
}
