import { useState, useEffect } from "react";
import { 
  getManualLeadsCount,
  formatDateForInput,
  formatDateForBackend 
} from "../utils/leadUtils";

function ManualLeadsSection({ email }) {
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
    siteVisitDate: "",
    siteVisitDone: "",
    siteVisitDoneDate: "",
    booked: "",
    feedback1: "",
    feedback2: "",
    feedback3: "",
    feedback4: "",
    feedback5: "",
    leadQuality: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const leadsPerPage = 10;

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            siteVisitDone: lead["Site Visit Done?"] || lead["SiteVisitDone"] || "",
            booked: lead["Booked?"] || lead["Booked"] || "",
            leadQuality: lead["Lead Quality"] || lead["LeadQuality"] || lead["Quality"] || "",
            feedback1: lead["Feedback 1"] || lead["Feedback1"] || "",
            feedback2: lead["Feedback 2"] || lead["Feedback2"] || "",
            feedback3: lead["Feedback 3"] || lead["Feedback3"] || "",
            feedback4: lead["Feedback 4"] || lead["Feedback4"] || "",
            feedback5: lead["Feedback 5"] || lead["Feedback5"] || "",
            siteVisitDate: lead["Site Visit Date"] || lead["SiteVisitDate"] || "",
            siteVisitDoneDate: lead["Site Visit Done Date"] || lead["SiteVisitDoneDate"] || ""
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
    try {
      // Basic validation
      if (!newLead.project || !newLead.name || !newLead.phone) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate site visit date if site visit is "Yes"
      if (newLead.siteVisit === "Yes") {
        if (!newLead.siteVisitDate) {
          alert("Please select a site visit date.");
          return;
        }
        
        // Ensure the selected date is today or in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part to compare dates only
        const selectedDate = new Date(newLead.siteVisitDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          alert("Site visit date cannot be in the past. Please select today or a future date.");
          return;
        }
      }

      // Validate site visit done date if site visit done is "Yes"
      if (newLead.siteVisitDone === "Yes") {
        if (!newLead.siteVisitDoneDate) {
          alert("Please select a site visit done date.");
          return;
        }
        
        // Ensure the selected date is today or in the past
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today for comparison
        const selectedDate = new Date(newLead.siteVisitDoneDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          alert("Site visit done date cannot be in the future. Please select today or a past date.");
          return;
        }
      }

      // Format the site visit date if needed
      let formattedDate = '';
      if (newLead.siteVisit === 'Yes' && newLead.siteVisitDate) {
        const date = new Date(newLead.siteVisitDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      // Format the site visit done date if needed
      let formattedDoneDate = '';
      if (newLead.siteVisitDone === 'Yes' && newLead.siteVisitDoneDate) {
        const date = new Date(newLead.siteVisitDoneDate);
        if (!isNaN(date.getTime())) {
          formattedDoneDate = date.toISOString().split('T')[0];
        }
      }

      // Format the data for the Google Apps Script
      const formattedData = {
        project: newLead.project,
        name: newLead.name,
        phone: newLead.phone,
        lookingFor: newLead.lookingFor || '',
        siteVisit: newLead.siteVisit || 'No',
        siteVisitDate: formattedDate,
        siteVisitDone: newLead.siteVisitDone || 'No',
        siteVisitDoneDate: formattedDoneDate,
        booked: newLead.booked || 'No',
        leadQuality: newLead.leadQuality || 'WIP',
        feedback1: newLead.feedback1 || '',
        feedback2: newLead.feedback2 || '',
        feedback3: newLead.feedback3 || '',
        feedback4: newLead.feedback4 || '',
        feedback5: newLead.feedback5 || ''
      };
      
      console.log('Submitting new lead with data:', formattedData);

      const leadId = "ML" + Date.now().toString().slice(-6);
      const leadData = {
        action: "addManualLead",
        leadId,
        email,
        project: formattedData.project,
        name: formattedData.name,
        phone: formattedData.phone,
        lookingFor: formattedData.lookingFor,
        siteVisit: formattedData.siteVisit,
        siteVisitDate: formattedData.siteVisitDate,
        siteVisitDone: formattedData.siteVisitDone,
        siteVisitDoneDate: formattedData.siteVisitDoneDate,
        booked: formattedData.booked,
        feedback1: formattedData.feedback1,
        feedback2: formattedData.feedback2,
        feedback3: formattedData.feedback3,
        feedback4: formattedData.feedback4,
        feedback5: formattedData.feedback5,
        leadQuality: formattedData.leadQuality
      };

      const params = new URLSearchParams(leadData);

      await fetch(`${scriptUrl}?${params.toString()}`);
      setNewLead({
        project: "",
        name: "",
        phone: "",
        lookingFor: "",
        siteVisit: "",
        siteVisitDate: "",
        siteVisitDone: "",
        siteVisitDoneDate: "",
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
    } catch (error) {
      console.error("Error submitting new lead:", error);
    }
  };

  const [expandedFeedback, setExpandedFeedback] = useState({});

  const toggleFeedbackExpansion = (leadId, feedbackNumber) => {
    const key = `${leadId}-${feedbackNumber}`;
    setExpandedFeedback(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Date formatting functions are now imported from leadUtils.js

  const handleEditInput = (leadId, field, value) => {
    setEditedValues(prev => {
      const newValues = {
        ...prev,
        [leadId]: {
          ...prev[leadId],
          [field]: value
        },
      };

      // Handle site visit changes
      if (field === 'siteVisit') {
        if (value === 'Yes') {
          // Show date picker when site visit is set to "Yes"
          setShowDatePicker(prev => ({
            ...prev,
            [leadId]: true
          }));
          
          // Set default date to tomorrow if not already set
          if (!newValues[leadId]?.siteVisitDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            newValues[leadId] = {
              ...newValues[leadId],
              siteVisitDate: formatDateForInput(tomorrow.toISOString().split('T')[0])
            };
          }
        } else {
          // If setting to No or empty, hide date picker and clear date
          setShowDatePicker(prev => ({
            ...prev,
            [leadId]: false
          }));
          
          newValues[leadId] = {
            ...newValues[leadId],
            siteVisitDate: ''
          };
        }
      }

      // Handle site visit done changes
      if (field === 'siteVisitDone') {
        if (value === 'Yes') {
          // Set default date to today if not already set
          if (!newValues[leadId]?.siteVisitDoneDate) {
            const today = new Date();
            newValues[leadId] = {
              ...newValues[leadId],
              siteVisitDoneDate: formatDateForInput(today.toISOString().split('T')[0])
            };
          }
        } else {
          // If setting to No or empty, clear date
          newValues[leadId] = {
            ...newValues[leadId],
            siteVisitDoneDate: ''
          };
        }
      }

      return newValues;
    });
  };

  const handleUpdate = async (leadId) => {
    try {
      const editedData = { ...(editedValues[leadId] || {}) };
      
      if (Object.keys(editedData).length === 0) {
        throw new Error('No fields to update');
      }
      
      // Format date fields before sending to backend
      if (editedData.siteVisitDate) {
        // Ensure the date is in the correct format for the backend
        const formattedDate = formatDateForBackend(editedData.siteVisitDate);
        if (formattedDate) {
          editedData.siteVisitDate = formattedDate;
        } else {
          // If date formatting fails, keep the original value and let the backend handle it
          console.warn('Could not format date, sending as-is:', editedData.siteVisitDate);
        }
      }
      
      // Format site visit done date fields before sending to backend
      if (editedData.siteVisitDoneDate) {
        // Ensure the date is in the correct format for the backend
        const formattedDoneDate = formatDateForBackend(editedData.siteVisitDoneDate);
        if (formattedDoneDate) {
          editedData.siteVisitDoneDate = formattedDoneDate;
        } else {
          // If date formatting fails, keep the original value and let the backend handle it
          console.warn('Could not format site visit done date, sending as-is:', editedData.siteVisitDoneDate);
        }
      }
      
      // If site visit is set to 'No', clear the date
      if (editedData.siteVisit === 'No') {
        editedData.siteVisitDate = '';
      }
      
      // If site visit done is set to 'No', clear the date
      if (editedData.siteVisitDone === 'No') {
        editedData.siteVisitDoneDate = '';
      }

      // Prepare URL parameters for the update
      const params = new URLSearchParams();
      
      // Add required parameters
      params.append('updateLead', 'true');
      params.append('leadId', leadId);
      params.append('sheetName', 'Manual Leads');
      
      // Add all edited fields to the parameters with proper column names
      Object.entries(editedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Convert field names to match Google Sheet column names
          let fieldName = key;
          if (key === 'siteVisit') fieldName = 'Site Visit?';
          if (key === 'siteVisitDate') fieldName = 'Site Visit Date';
          if (key === 'siteVisitDone') fieldName = 'Site Visit Done?';
          if (key === 'siteVisitDoneDate') fieldName = 'Site Visit Done Date';
          if (key === 'booked') fieldName = 'Booked?';
          if (key === 'leadQuality') fieldName = 'Lead Quality';
          if (key === 'lookingFor') fieldName = 'Looking For';
          
          params.append(fieldName, value);
        }
      });
      
      // Add feedback fields if they exist
      for (let i = 1; i <= 5; i++) {
        const feedbackKey = `feedback${i}`;
        if (editedData[feedbackKey] !== undefined && editedData[feedbackKey] !== '') {
          params.append(`Feedback ${i}`, editedData[feedbackKey]);
        }
      }

      const url = `${scriptUrl}?${params.toString()}`;
      console.log('Sending update to URL:', url);
      
      // Make the GET request with the constructed URL
      const response = await fetch(url);
      
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

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => {
    // If no search term, include all leads
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Safely check each field with null/undefined checks
    const nameMatch = lead['Name']?.toLowerCase().includes(searchLower) || false;
    const phoneMatch = lead['Phone Number']?.toString().includes(searchTerm) || false;
    const projectMatch = lead['Project']?.toLowerCase().includes(searchLower) || false;
    const lookingForMatch = lead['Looking For']?.toLowerCase().includes(searchLower) || false;
    const leadQualityMatch = lead['Lead Quality']?.toLowerCase().includes(searchLower) || false;
    
    return nameMatch || phoneMatch || projectMatch || lookingForMatch || leadQualityMatch;
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
          <div className="w-full">
            <select 
              value={newLead.siteVisit} 
              onChange={(e) => {
                handleInputChange("siteVisit", e.target.value);
                // Clear site visit date when changing from Yes to No/empty
                if (e.target.value !== "Yes") {
                  handleInputChange("siteVisitDate", "");
                } else if (e.target.value === "Yes" && !newLead.siteVisitDate) {
                  // Set default to today if switching to Yes and no date set
                  handleInputChange("siteVisitDate", new Date().toISOString().split('T')[0]);
                }
              }} 
              className="w-full border border-blue-200 rounded px-3 py-2"
            >
              <option value="">Site Visit?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {newLead.siteVisit === "Yes" && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">Site Visit Date</label>
                <input
                  type="date"
                  value={newLead.siteVisitDate}
                  onChange={(e) => handleInputChange("siteVisitDate", e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            )}
          </div>
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
          
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by name, phone, project, or quality..."
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
              <th className="p-2">Site Visit Date</th>
              <th className="p-2">Site Visit Done?</th>
              <th className="p-2">Site Visit Done Date</th>
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
                          value={values.siteVisit !== undefined ? values.siteVisit : (lead["Site Visit?"] || 'No')} 
                          onChange={(e) => {
                            const value = e.target.value;
                            handleEditInput(id, "siteVisit", value);
                            
                            // If setting to Yes and no date is set, set default to tomorrow
                            if (value === 'Yes' && !values.siteVisitDate && !lead["Site Visit Date"]) {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              const defaultDate = tomorrow.toISOString().split('T')[0];
                              handleEditInput(id, "siteVisitDate", defaultDate);
                            }
                          }} 
                          className="border px-2 py-1 rounded"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                        {showDatePicker[id] && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Site Visit Date</label>
                            <input
                              type="date"
                              value={values.siteVisitDate !== undefined 
                                ? values.siteVisitDate 
                                : (lead["Site Visit Date"] 
                                    ? formatDateForInput(lead["Site Visit Date"]) 
                                    : "")}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                if (!selectedDate) {
                                  // If date is cleared, set site visit to No
                                  handleEditInput(id, "siteVisit", "No");
                                  handleEditInput(id, "siteVisitDate", "");
                                  return;
                                }
                                
                                // Format the date to YYYY-MM-DD to ensure consistency
                                const date = new Date(selectedDate);
                                if (!isNaN(date.getTime())) {
                                  const formattedDate = date.toISOString().split('T')[0];
                                  handleEditInput(id, "siteVisitDate", formattedDate);
                                } else {
                                  // If date is invalid, use the raw value and let the validation handle it
                                  handleEditInput(id, "siteVisitDate", selectedDate);
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                              required
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div>{lead["Site Visit?"] || 'No'}</div>
                        {lead["Site Visit Date"] && (
                          <div className="text-xs text-gray-600">
                            {new Date(lead["Site Visit Date"]).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    {values.siteVisitDate !== undefined 
                      ? new Date(values.siteVisitDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : (lead["Site Visit Date"] 
                          ? new Date(lead["Site Visit Date"]).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "-")}
                  </td>
                  <td className="p-2">
                    {isEditable ? (
                      <div className="flex flex-col space-y-2">
                        <select 
                          value={values.siteVisitDone !== undefined ? values.siteVisitDone : (lead["Site Visit Done?"] || 'No')} 
                          onChange={(e) => {
                            const value = e.target.value;
                            handleEditInput(id, "siteVisitDone", value);
                            
                            // If setting to Yes and no date is set, set default to today
                            if (value === 'Yes' && !values.siteVisitDoneDate && !lead["Site Visit Done Date"]) {
                              const today = new Date();
                              const defaultDate = today.toISOString().split('T')[0];
                              handleEditInput(id, "siteVisitDoneDate", defaultDate);
                            }
                          }} 
                          className="border px-2 py-1 rounded"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                        {values.siteVisitDone === 'Yes' && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Site Visit Done Date</label>
                            <input
                              type="date"
                              value={values.siteVisitDoneDate !== undefined 
                                ? values.siteVisitDoneDate 
                                : (lead["Site Visit Done Date"] 
                                    ? formatDateForInput(lead["Site Visit Done Date"]) 
                                    : "")}
                              max={new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                if (!selectedDate) {
                                  // If date is cleared, set site visit done to No
                                  handleEditInput(id, "siteVisitDone", "No");
                                  handleEditInput(id, "siteVisitDoneDate", "");
                                  return;
                                }
                                
                                // Format the date to YYYY-MM-DD to ensure consistency
                                const date = new Date(selectedDate);
                                if (!isNaN(date.getTime())) {
                                  const formattedDate = date.toISOString().split('T')[0];
                                  handleEditInput(id, "siteVisitDoneDate", formattedDate);
                                } else {
                                  // If date is invalid, use the raw value and let the validation handle it
                                  handleEditInput(id, "siteVisitDoneDate", selectedDate);
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                              required
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div>{lead["Site Visit Done?"] || 'No'}</div>
                        {lead["Site Visit Done Date"] && (
                          <div className="text-xs text-gray-600">
                            {new Date(lead["Site Visit Done Date"]).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    {values.siteVisitDoneDate !== undefined 
                      ? new Date(values.siteVisitDoneDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : (lead["Site Visit Done Date"] 
                          ? new Date(lead["Site Visit Done Date"]).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "-")}
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

export default ManualLeadsSection;