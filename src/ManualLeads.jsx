// import { useEffect, useState } from "react";

// export default function ManualLeads() {
//   const email = localStorage.getItem("email");
//   const [leads, setLeads] = useState([]);
//   const [newLead, setNewLead] = useState({
//     project: "",
//     name: "",
//     phone: "",
//     lookingFor: "",
//     siteVisit: "",
//     booked: "",
//     feedback1: "",
//     feedback2: "",
//     feedback3: "",
//     feedback4: "",
//     feedback5: "",
//   });

//   const scriptUrl = `https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec`;

//   const fetchManualLeads = async () => {
//     const res = await fetch(`${scriptUrl}?action=getManualLeads&email=${email}`);
//     const data = await res.json();
//     setLeads(data); // show oldest first (default)
//   };

//   const handleInputChange = (field, value) => {
//     setNewLead({ ...newLead, [field]: value });
//   };

//   const handleSubmit = async () => {
//     if (!newLead.name || !newLead.phone || !newLead.project) {
//       alert("Name, Phone, and Project are required.");
//       return;
//     }

//     const leadId = "ML" + Date.now().toString().slice(-6);

//     const params = new URLSearchParams({
//       action: "addManualLead",
//       leadId,
//       email,
//       ...newLead,
//     });

//     await fetch(`${scriptUrl}?${params.toString()}`);
//     setNewLead({
//       project: "",
//       name: "",
//       phone: "",
//       lookingFor: "",
//       siteVisit: "",
//       booked: "",
//       feedback1: "",
//       feedback2: "",
//       feedback3: "",
//       feedback4: "",
//       feedback5: "",
//     });
//     fetchManualLeads(); // reload list
//   };

//   useEffect(() => {
//     fetchManualLeads();
//   }, []);

//   // Get all unique project names from leads
//   const allProjects = Array.from(new Set(leads.map(l => l.project || l["Project"]).filter(Boolean))).sort();

//   return (
//     <div>
//       <h3 className="text-lg font-semibold mb-4">Add New Manual Lead</h3>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <select
//           value={newLead.project}
//           onChange={(e) => handleInputChange("project", e.target.value)}
//           className="border rounded px-3 py-2"
//         >
//           <option value="">Select Project</option>
//           <option value="Orchid Life">Orchid Life</option>
//           <option value="Orchid Salisbury">Orchid Salisbury</option>
//           <option value="Orchid Bloomsberry">Orchid Bloomsberry</option>
//           <option value="Orchid Platinum">Orchid Platinum</option>
//           <option value="Riviera Uno">Riviera Uno</option>
//         </select>
//         <input
//           type="text"
//           placeholder="Name"
//           value={newLead.name}
//           onChange={(e) => handleInputChange("name", e.target.value)}
//           className="border rounded px-3 py-2"
//         />
//         <input
//           type="text"
//           placeholder="Phone Number"
//           value={newLead.phone}
//           onChange={(e) => handleInputChange("phone", e.target.value)}
//           className="border rounded px-3 py-2"
//         />
//         <input
//           type="text"
//           placeholder="Looking For?"
//           value={newLead.lookingFor}
//           onChange={(e) => handleInputChange("lookingFor", e.target.value)}
//           className="border rounded px-3 py-2"
//         />
//         <select
//           value={newLead.siteVisit}
//           onChange={(e) => handleInputChange("siteVisit", e.target.value)}
//           className="border rounded px-3 py-2"
//         >
//           <option value="">Site Visit?</option>
//           <option value="Yes">Yes</option>
//           <option value="No">No</option>
//         </select>
//         <select
//           value={newLead.booked}
//           onChange={(e) => handleInputChange("booked", e.target.value)}
//           className="border rounded px-3 py-2"
//         >
//           <option value="">Booked?</option>
//           <option value="Yes">Yes</option>
//           <option value="No">No</option>
//         </select>
//         <input
//           type="text"
//           placeholder="Feedback 1"
//           value={newLead.feedback1}
//           onChange={(e) => handleInputChange("feedback1", e.target.value)}
//           className="border rounded px-3 py-2 col-span-1 sm:col-span-2"
//         />
//         <input
//           type="text"
//           placeholder="Feedback 2"
//           value={newLead.feedback2}
//           onChange={(e) => handleInputChange("feedback2", e.target.value)}
//           className="border rounded px-3 py-2 col-span-1 sm:col-span-2"
//         />
//         <input
//           type="text"
//           placeholder="Feedback 3"
//           value={newLead.feedback3}
//           onChange={(e) => handleInputChange("feedback3", e.target.value)}
//           className="border rounded px-3 py-2 col-span-1 sm:col-span-2"
//         />
//         <input
//           type="text"
//           placeholder="Feedback 4"
//           value={newLead.feedback4}
//           onChange={(e) => handleInputChange("feedback4", e.target.value)}
//           className="border rounded px-3 py-2 col-span-1 sm:col-span-2"
//         />
//         <input
//           type="text"
//           placeholder="Feedback 5"
//           value={newLead.feedback5}
//           onChange={(e) => handleInputChange("feedback5", e.target.value)}
//           className="border rounded px-3 py-2 col-span-1 sm:col-span-2"
//         />
//         <button
//           onClick={handleSubmit}
//           className="bg-black text-white rounded px-4 py-2 col-span-1 sm:col-span-2"
//         >
//           ➕ Add Lead
//         </button>
//       </div>

//       {/* Manual Leads Table */}
//       <h3 className="text-lg font-semibold mt-8 mb-2">Your Manual Leads</h3>

//       <div className="overflow-x-auto">
//         <table className="w-full bg-white shadow-md rounded-xl text-sm">
//           <thead className="bg-gray-200 text-gray-700">
//             <tr>
//               <th className="p-2">Lead ID</th>
//               <th className="p-2">Project</th>
//               <th className="p-2">Name</th>
//               <th className="p-2">Phone</th>
//               <th className="p-2">Looking For?</th>
//               <th className="p-2">Assignee</th>
//               <th className="p-2">Site Visit?</th>
//               <th className="p-2">Booked?</th>
//               <th className="p-2">Feedback 1</th>
//               <th className="p-2">Feedback 2</th>
//               <th className="p-2">Feedback 3</th>
//               <th className="p-2">Feedback 4</th>
//               <th className="p-2">Feedback 5</th>
//             </tr>
//           </thead>
//           <tbody>
//             {leads.map((lead, idx) => (
//               <tr key={idx} className="border-t hover:bg-gray-50">
//                 <td className="p-2">{lead["Lead ID"]}</td>
//                 <td className="p-2">{lead["Project"]}</td>
//                 <td className="p-2">{lead["Name"]}</td>
//                 <td className="p-2">{lead["Phone Number"]}</td>
//                 <td className="p-2">{lead["Looking For?"]}</td>
//                 <td className="p-2">{lead["Assignee"]}</td>
//                 <td className="p-2">{lead["Site Visit?"]}</td>
//                 <td className="p-2">{lead["Booked?"]}</td>
//                 <td className="p-2">{lead["Feedback 1"]}</td>
//                 <td className="p-2">{lead["Feedback 2"]}</td>
//                 <td className="p-2">{lead["Feedback 3"]}</td>
//                 <td className="p-2">{lead["Feedback 4"]}</td>
//                 <td className="p-2">{lead["Feedback 5"]}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
