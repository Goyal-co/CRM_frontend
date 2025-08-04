import { useState, useEffect } from "react";

export default function ManualLeadsSection({ email }) {
  const [leads, setLeads] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [showDatePicker, setShowDatePicker] = useState({});
  const [successMessage, setSuccessMessage] = useState(""); // ✅ toast state
  const [newLead, setNewLead] = useState({
    project: "",
    name: "",
    phone: "",
    lookingFor: "",
    siteVisit: "",
    booked: "",
    feedback1: "",
    feedback2: "",
    feedback3: "",
    feedback4: "",
    feedback5: "",
    leadQuality: "", // Add leadQuality to newLead state
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const leadsPerPage = 10;

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const scriptUrl = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec`;

  const fetchManualLeads = async () => {
    try {
      const res = await fetch(`${scriptUrl}?action=getManualLeads&email=${email}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Set the leads data
        setLeads(data);
        
        // Initialize edited values with all fields from the sheet
        const values = {};
        data.forEach((lead) => {
          values[lead["Lead ID"]] = {
            siteVisit: lead["Site Visit?"] || lead["SiteVisit"] || "",
            booked: lead["Booked?"] || lead["Booked"] || "",
            leadQuality: lead["Lead Quality"] || lead["LeadQuality"] || lead["Quality"] || "",
            feedback1: lead["Feedback 1"] || lead["Feedback1"] || "",
            feedback2: lead["Feedback 2"] || lead["Feedback2"] || "",
            feedback3: lead["Feedback 3"] || lead["Feedback3"] || "",
            feedback4: lead["Feedback 4"] || lead["Feedback4"] || "",
            feedback5: lead["Feedback 5"] || lead["Feedback5"] || "",
            siteVisitDate: lead["Site Visit Date"] || lead["SiteVisitDate"] || ""
          };
        });
        
        setEditedValues(values);
      } else {
        console.error("Invalid data format received:", data);
      }
    } catch (error) {
      console.error("Error fetching manual leads:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!newLead.name || !newLead.phone || !newLead.project) {
      alert("Name, Phone, and Project are required.");
      return;
    }

    const leadId = "ML" + Date.now().toString().slice(-6);
    // Create a new object with the correct field names for the backend
    const leadData = {
      action: "addManualLead",
      leadId,
      email,
      project: newLead.project,
      name: newLead.name,
      phone: newLead.phone,
      lookingFor: newLead.lookingFor, // This will be mapped to "Looking For" in the backend
      siteVisit: newLead.siteVisit,
      booked: newLead.booked,
      feedback1: newLead.feedback1,
      feedback2: newLead.feedback2,
      feedback3: newLead.feedback3,
      feedback4: newLead.feedback4,
      feedback5: newLead.feedback5,
      leadQuality: newLead.leadQuality
    };

    const params = new URLSearchParams(leadData);

    await fetch(`${scriptUrl}?${params.toString()}`);
    setNewLead({
      project: "",
      name: "",
      phone: "",
      lookingFor: "",
      siteVisit: "",
      booked: "",
      feedback1: "",
      feedback2: "",
      feedback3: "",
      feedback4: "",
      feedback5: "",
      leadQuality: "",
    });
    setCurrentPage(1);
    fetchManualLeads();
  };

  const [expandedFeedback, setExpandedFeedback] = useState({});

  const toggleFeedbackExpansion = (leadId, feedbackNumber) => {
    const key = `${leadId}-${feedbackNumber}`;
    setExpandedFeedback(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEditInput = (leadId, field, value) => {
    setEditedValues((prev) => {
      const newValues = {
        ...prev,
        [leadId]: {
          ...prev[leadId],
          [field]: value,
        },
      };

      // Show date picker when site visit is set to "Yes"
      if (field === 'siteVisit' && value === 'Yes') {
        setShowDatePicker(prev => ({
          ...prev,
          [leadId]: true
        }));
        
        // Set default date to today if not already set
        if (!newValues[leadId]?.siteVisitDate) {
          newValues[leadId] = {
            ...newValues[leadId],
            siteVisitDate: new Date().toISOString().split('T')[0]
          };
        }
      } else if (field === 'siteVisit' && value === 'No') {
        setShowDatePicker(prev => ({
          ...prev,
          [leadId]: false
        }));
      }

      return newValues;
    });
  };

  const handleUpdate = async (leadId) => {
    try {
      const fields = editedValues[leadId];
      if (!fields) {
        throw new Error('No fields to update');
      }

      // Create update object with all fields
      const updates = {
        'Site Visit?': fields.siteVisit || '',
        'Booked?': fields.booked || '',
        'Lead Quality': fields.leadQuality || '',
        'Looking For': fields.lookingFor || '',
        'Feedback 1': fields.feedback1 || '',
        'Feedback 2': fields.feedback2 || '',
        'Feedback 3': fields.feedback3 || '',
        'Feedback 4': fields.feedback4 || '',
        'Feedback 5': fields.feedback5 || ''
      };

      // Add site visit date if site visit is "Yes"
      if (fields.siteVisit === 'Yes' && fields.siteVisitDate) {
        updates['Site Visit Date'] = fields.siteVisitDate;
      } else if (fields.siteVisit === 'No') {
        updates['Site Visit Date'] = '';
      }

      const updateData = {
        leadId,
        action: 'updateManualLead',
        updates: JSON.stringify(updates)
      };

      // Send all updates in a single request
      const params = new URLSearchParams(updateData);
      const response = await fetch(`${scriptUrl}?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const result = await response.text();
      
      // Check for error in response
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        // If not JSON, treat as plain text
        if (result.toLowerCase().includes('error')) {
          throw new Error(result);
        }
      }

      if (parsedResult && parsedResult.error) {
        throw new Error(parsedResult.error);
      }

      // Clear the edited values for this lead
      setEditedValues(prev => {
        const newValues = { ...prev };
        delete newValues[leadId];
        return newValues;
      });
      
      // Hide date picker
      setShowDatePicker(prev => ({
        ...prev,
        [leadId]: false
      }));

      setSuccessMessage('Lead updated successfully!');
      fetchManualLeads();
    } catch (error) {
      console.error('Update failed:', error);
      setSuccessMessage(`Error: ${error.message}`);
    } finally {
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  useEffect(() => {
    fetchManualLeads();
  }, []);

  // Filter leads based on search term and date
  const filteredLeads = leads.filter(lead => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      (lead['Name'] && lead['Name'].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead['Phone Number'] && lead['Phone Number'].includes(searchTerm)) ||
      (lead['Project'] && lead['Project'].toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date filter (if date is selected)
    let matchesDate = true;
    if (dateFilter) {
      const leadDate = lead['Timestamp'] || lead['Date Added'] || '';
      matchesDate = leadDate.includes(dateFilter);
    }
    
    return matchesSearch && matchesDate;
  });

  // Get current leads for pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

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
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm relative">
      {/* ✅ Toast */}
      {successMessage && (
        <div
          id="success-toast"
          className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in z-50"
        >
          ✅ {successMessage}
        </div>
      )}

      {/* Add New Lead Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">➕ Add New Manual Lead</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-sm">WIP: {qualityCounts.WIP}</div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-bold text-sm">Warm: {qualityCounts.Warm}</div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-sm">Cold: {qualityCounts.Cold}</div>
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded font-bold text-sm">RNR: {qualityCounts.RNR}</div>
          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold text-sm">Junk: {qualityCounts.Junk}</div>
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-sm">Invalid: {qualityCounts.Invalid}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={newLead.project}
            onChange={(e) => handleInputChange("project", e.target.value)}
            className="border border-blue-200 rounded px-3 py-2"
          >
            <option value="">Select Project</option>
            <option value="Orchid Life">Orchid Life</option>
            <option value="Orchid Salisbury">Orchid Salisbury</option>
            <option value="Orchid Bloomsberry">Orchid Bloomsberry</option>
            <option value="Orchid Platinum">Orchid Platinum</option>
            <option value="Riviera Uno">Riviera Uno</option>
          </select>
          <input type="text" placeholder="Name" value={newLead.name} onChange={(e) => handleInputChange("name", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
          <input type="text" placeholder="Phone Number" value={newLead.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
          <input 
            type="text" 
            placeholder="Looking For" 
            value={newLead.lookingFor} 
            onChange={(e) => handleInputChange("lookingFor", e.target.value)} 
            className="border border-blue-200 rounded px-3 py-2" 
          />
          <select value={newLead.siteVisit} onChange={(e) => handleInputChange("siteVisit", e.target.value)} className="border border-blue-200 rounded px-3 py-2">
            <option value="">Site Visit?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <select value={newLead.booked} onChange={(e) => handleInputChange("booked", e.target.value)} className="border border-blue-200 rounded px-3 py-2">
            <option value="">Booked?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <select value={newLead.leadQuality} onChange={(e) => handleInputChange("leadQuality", e.target.value)} className="border border-blue-200 rounded px-3 py-2">
            <option value="">Lead Quality</option>
            <option value="WIP">WIP</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
            <option value="RNR">RNR (Ring No Reply)</option>
            <option value="Junk">Junk</option>
            <option value="Invalid">Invalid</option>
          </select>
          <input type="text" placeholder="Feedback 1" value={newLead.feedback1} onChange={(e) => handleInputChange("feedback1", e.target.value)} className="border border-blue-200 rounded px-3 py-2" />
        </div>
        <button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold">
          ➕ Add Lead
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-blue-900">📋 Manual Leads List</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by name, phone, or project..."
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
            
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-500 flex items-center">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
            </div>
          </div>
        </div>

        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-2">Lead ID</th>
              <th className="p-2">Project</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Looking For?</th>
              <th className="p-2">Assignee</th>
              <th className="p-2">Site Visit?</th>
              <th className="p-2">Booked?</th>
              <th className="p-2">Lead Quality</th>
              <th className="p-2">Feedback 1</th>
              <th className="p-2">Feedback 2</th>
              <th className="p-2">Feedback 3</th>
              <th className="p-2">Feedback 4</th>
              <th className="p-2">Feedback 5</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead, idx) => {
              const id = lead["Lead ID"];
              const isEditable = lead["Assignee"] === email;
              const values = editedValues[id] || {};

              return (
                <tr key={idx} className="border-b hover:bg-blue-50">
                  <td className="p-2">{id}</td>
                  <td className="p-2">{lead["Project"]}</td>
                  <td className="p-2">{lead["Name"]}</td>
                  <td className="p-2">{lead["Phone Number"]}</td>
                  <td className="p-2">{lead["Looking For"] || lead["Looking For?"]}</td>
                  <td className="p-2">{lead["Assignee"]}</td>
                  <td className="p-2">
                    {isEditable ? (
                      <div className="flex flex-col space-y-2">
                        <select 
                          value={values.siteVisit || lead["Site Visit?"]} 
                          onChange={(e) => handleEditInput(id, "siteVisit", e.target.value)} 
                          className="border px-2 py-1 rounded"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                        {showDatePicker[id] && (
                          <input
                            type="date"
                            value={values.siteVisitDate || lead["Site Visit Date"] || new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleEditInput(id, "siteVisitDate", e.target.value)}
                            className="border px-2 py-1 rounded text-sm"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <div>{lead["Site Visit?"]}</div>
                        {lead["Site Visit?"] === "Yes" && lead["Site Visit Date"] && (
                          <div className="text-xs text-gray-500">
                            {new Date(lead["Site Visit Date"]).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <select value={values.booked || lead["Booked?"]} onChange={(e) => handleEditInput(id, "booked", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : lead["Booked?"]}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <select value={values.leadQuality || lead["Lead Quality"] || ""} onChange={(e) => handleEditInput(id, "leadQuality", e.target.value)} className="border px-2 py-1 rounded">
                        <option value="">Lead Quality</option>
                        <option value="WIP">WIP</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                        <option value="RNR">RNR (Ring No Reply)</option>
                        <option value="Junk">Junk</option>
                        <option value="Invalid">Invalid</option>
                      </select>
                    ) : lead["Lead Quality"]}
                  </td>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <td key={i} className="p-2 min-w-[150px]">
                      {isEditable ? (
                        <div 
                          className={`relative ${expandedFeedback[`${lead["Lead ID"]}-${i}`] ? 'fixed inset-0 z-50 bg-white p-4 shadow-lg' : ''}`}
                          onClick={() => toggleFeedbackExpansion(lead["Lead ID"], i)}
                        >
                          <textarea
                            className={`w-full p-2 border rounded ${expandedFeedback[`${lead["Lead ID"]}-${i}`] ? 'h-64' : 'h-20'}`}
                            value={editedValues[lead["Lead ID"]]?.[`feedback${i}`] || lead[`Feedback ${i}`] || ''}
                            onChange={(e) => handleEditInput(lead["Lead ID"], `feedback${i}`, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={`Enter feedback ${i}...`}
                            rows="3"
                          />
                          {expandedFeedback[`${lead["Lead ID"]}-${i}`] && (
                            <button 
                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFeedbackExpansion(lead["Lead ID"], i);
                              }}
                            >
                              Done
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{lead[`Feedback ${i}`]}</div>
                      )}
                    </td>
                  ))}
                  <td className="p-2">
                    {isEditable && (
                      <button onClick={() => handleUpdate(id)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded">
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-500">
            Showing {Math.min(indexOfFirstLead + 1, filteredLeads.length)}-{Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
          </div>
          
          <div className="flex flex-wrap justify-center gap-1">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            
            {Array.from({ 
              length: Math.min(5, Math.ceil(filteredLeads.length / leadsPerPage)) 
            }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (Math.ceil(filteredLeads.length / leadsPerPage) <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= Math.ceil(filteredLeads.length / leadsPerPage) - 2) {
                pageNum = Math.ceil(filteredLeads.length / leadsPerPage) - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum < 1 || pageNum > Math.ceil(filteredLeads.length / leadsPerPage)) {
                return null;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredLeads.length / leadsPerPage) || filteredLeads.length === 0}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => paginate(Math.ceil(filteredLeads.length / leadsPerPage))}
              disabled={currentPage === Math.ceil(filteredLeads.length / leadsPerPage) || filteredLeads.length === 0}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getManualLeadsCount(leads) {
  return Array.isArray(leads) ? leads.length : 0;
}
