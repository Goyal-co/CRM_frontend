import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoLoader from '../components/VideoLoader';
import { format } from 'date-fns';

export default function AllLeadsView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'auto', or 'manual'
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  const scriptUrl = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec`;

  // Get all unique column names from all leads
  const getAllColumns = (data) => {
    const columnSet = new Set();
    data.forEach(lead => {
      Object.keys(lead).forEach(key => {
        if (!['leadType', 'id', 'timestamp'].includes(key)) {
          columnSet.add(key);
        }
      });
    });
    return Array.from(columnSet);
  };

  // Common columns that should be shown first
  const commonColumns = [
    'Name', 'Phone Number', 'Email', 'Project', 'Lead Source', 
    'Lead Quality', 'Overall Quality', 'Status', 'Called?', 
    'Site Visit?', 'Site Visit Done?', 'Booked?', 'Last Updated', 'Timestamp'
  ];

  // Format column name for display
  const formatColumnName = (col) => {
    return col
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        // Fetch both auto and manual leads
        const [autoLeadsRes, manualLeadsRes] = await Promise.all([
          fetch(`${scriptUrl}?action=getLeads`),
          fetch(`${scriptUrl}?action=getManualLeads`)
        ]);
        
        let autoLeads = [];
        let manualLeads = [];
        
        try {
          autoLeads = await autoLeadsRes.json();
          manualLeads = await manualLeadsRes.json();
        } catch (error) {
          console.error('Error parsing JSON:', error);
          throw new Error('Failed to parse leads data');
        }
        
        // Process auto leads
        const processedAutoLeads = Array.isArray(autoLeads) 
          ? autoLeads.map(lead => ({
              ...lead,
              leadType: 'auto',
              'Last Updated': lead['Last Updated'] || lead['Timestamp'] || lead['Date'] || ''
            })) 
          : [];
          
        // Process manual leads
        const processedManualLeads = Array.isArray(manualLeads)
          ? manualLeads.map(lead => ({
              ...lead,
              leadType: 'manual',
              'Last Updated': lead['Last Updated'] || lead['Timestamp'] || lead['Date'] || ''
            }))
          : [];
          
        const allLeads = [...processedAutoLeads, ...processedManualLeads];
        setLeads(allLeads);
        
        // Get all unique columns and sort them with common columns first
        const allColumns = getAllColumns(allLeads);
        const sortedColumns = [
          ...commonColumns.filter(col => allColumns.includes(col)),
          ...allColumns.filter(col => !commonColumns.includes(col))
        ];
        
        setColumns(sortedColumns);
      } catch (error) {
        console.error('Error fetching leads:', error);
        alert(`Failed to load leads: ${error.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Filter leads based on search term and active tab
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Filter by active tab
      if (activeTab === 'auto' && lead.leadType !== 'auto') return false;
      if (activeTab === 'manual' && lead.leadType !== 'manual') return false;
      
      // Filter by search term if provided
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Search in all string fields
      return Object.entries(lead).some(([key, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }, [leads, activeTab, searchTerm]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : format(date, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };
  
  // Get status badge class based on lead status
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('booked')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('visit') && statusLower.includes('done')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('visit')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('called')) return 'bg-purple-100 text-purple-800';
    if (statusLower.includes('new')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  // Get quality badge class
  const getQualityBadgeClass = (quality) => {
    if (!quality) return 'bg-gray-100 text-gray-800';
    
    const qualityLower = quality.toLowerCase();
    if (qualityLower.includes('warm')) return 'bg-yellow-100 text-yellow-800';
    if (qualityLower.includes('hot')) return 'bg-red-100 text-red-800';
    if (qualityLower.includes('cold')) return 'bg-blue-100 text-blue-800';
    if (qualityLower.includes('rnr')) return 'bg-purple-100 text-purple-800';
    if (qualityLower.includes('junk')) return 'bg-gray-200 text-gray-800';
    if (qualityLower.includes('invalid')) return 'bg-gray-300 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <VideoLoader message="Loading all leads..." size="large" />
      </div>
    );
  }
  
  if (leads.length === 0 && !loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No leads found. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('auto')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'auto' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Auto Leads ({leads.filter(l => l.leadType === 'auto').length})
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'manual' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manual Leads ({leads.filter(l => l.leadType === 'manual').length})
            </button>
          </div>
          
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by name, phone, project, or quality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} total leads
          </div>
          <div className="overflow-auto max-h-[70vh] border border-gray-200 rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white">Type</th>
                  {columns.map((column, index) => (
                    <th 
                      key={column} 
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {formatColumnName(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => {
                    // Get status for this lead
                    const status = lead['Booked?'] === 'Yes' 
                      ? 'Booked' 
                      : lead['Site Visit Done?'] === 'Yes'
                        ? 'Visit Done'
                        : lead['Site Visit?'] === 'Yes' 
                          ? 'Site Visit' 
                          : lead['Called?'] === 'Yes'
                            ? 'Called'
                            : 'New';
                            
                    return (
                      <tr 
                        key={`${lead.leadType}-${lead['Lead ID'] || lead['Phone Number'] || lead['Phone'] || index}`} 
                        className="hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-white">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lead.leadType === 'auto' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {lead.leadType === 'auto' ? 'Auto' : 'Manual'}
                          </span>
                        </td>
                        
                        {columns.map(column => {
                          const value = lead[column] || '';
                          let displayValue = value;
                          
                          // Format specific columns
                          if (['Last Updated', 'Timestamp', 'Date', 'Created At', 'Updated At'].includes(column)) {
                            displayValue = formatDate(value);
                          } else if (column === 'Status' || column === 'Lead Status') {
                            return (
                              <td key={column} className="py-4 px-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(value)}`}>
                                  {value || 'N/A'}
                                </span>
                              </td>
                            );
                          } else if (column === 'Lead Quality' || column === 'Overall Quality') {
                            return (
                              <td key={column} className="py-4 px-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getQualityBadgeClass(value)}`}>
                                  {value || 'N/A'}
                                </span>
                              </td>
                            );
                          } else if (column === 'Phone Number' || column === 'Phone') {
                            displayValue = value ? value.replace(/(\d{5})(\d{5})/, '$1 $2') : '';
                          }
                          
                          return (
                            <td 
                              key={column} 
                              className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate"
                              title={String(displayValue)}
                            >
                              {displayValue || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-8 text-center text-gray-500">
                      No leads found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Total leads: {leads.length} (Auto: {leads.filter(l => l.leadType === 'auto').length}, Manual: {leads.filter(l => l.leadType === 'manual').length})</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
