import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Files, Link as LinkIcon, FileBox, Plus, Trash2, LayoutDashboard } from "lucide-react";

const WarehouseSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  const getHeaders = () => {
    return {
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    };
  };
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const staticNavItems = [
    { path: "/warehouse/trigger-files", label: "Trigger Files", icon: Files },
    { path: "/warehouse/connect-files", label: "Connect Files", icon: LinkIcon },
    { path: "/warehouse/static-files", label: "Static Files", icon: FileBox },
  ];

  const [dynamicNavItems, setDynamicNavItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [description, setDescription] = useState("");
  
  // Fetch customized sections
  const fetchSections = async () => {
    try {
      const response = await fetch("http://localhost:5001/services/WareHouse/CustomizedSection", {
        method: "GET",
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sections) {
          const formattedSections = data.sections.map((section) => ({
            path: `/warehouse/customized-section/${section.sectionId}`,
            label: section.name,
            id: section.sectionId,
            description: section.description.length > 10 ? section.description.substring(0, 10) + "..." : section.description,
          }));
          setDynamicNavItems(formattedSections);
        }
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [token]);

  const handleCreateSection = async () => {
    if (!sectionName.trim()) return;
    try {
      const response = await fetch("http://localhost:5001/services/WareHouse/createCustomizedSection", { 
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ section_name: sectionName, section_description: description }),
      });
  
      if (response.ok) {
        fetchSections();
      } else {
        console.error("Failed to create section", await response.text());
      }
    } catch (error) {
      console.error("Error creating section:", error);
    }
    setIsModalOpen(false);
    setSectionName("");
    setDescription("");
  };

  const handleDeleteClick = (sectionId) => {
    setSectionToDelete(sectionId);
  };
  
  const confirmDelete = async () => {
    if (!sectionToDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/services/WareHouse/customizedSection/${sectionToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchSections();
      } else {
        console.error("Failed to delete section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
    } finally {
      setSectionToDelete(null);
    }
  };

  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-16 flex flex-col">
      {/* Dashboard Button */}
      <div className="py-3 border-b border-gray-200">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-left px-8 py-3 flex items-center space-x-3 font-bold text-gray-700 hover:bg-gray-50"
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Dashboard
        </button>
      </div>

      {/* Create Section Button */}
      <div className="py-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full text-left px-8 py-3 flex items-center space-x-3 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Section
        </button>
      </div>

      {/* Static Nav Items */}
      <div className="py-4">
        {staticNavItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 font-medium ${
              location.pathname === path ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t border-gray-300 mx-4 my-2"></div>
      <h3 className="text-gray-500 text-sm font-bold px-6 py-2">Customized Sections</h3>

      {/* Dynamic Nav Items */}
      <div className="py-2 flex-grow">
        {dynamicNavItems.map(({ path, label, id, description }) => (
          <div 
            key={id}  
            className={`w-full text-left px-6 py-3 flex justify-between items-center font-medium ${
              location.pathname === `/warehouse/customized-section/${id}` 
                ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <button
              onClick={() => navigate(`/warehouse/customized-section/${id}`)}  
              className="flex items-center space-x-3 font-medium"
            >
              <FileBox className="w-5 h-5" />
              <div className="flex flex-col">
                <span>{label}</span>
                <span className="text-xs text-gray-400">{description}</span>
              </div>
            </button>

            <button 
              onClick={() => handleDeleteClick(id)} 
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Create Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Create Section</h2>
            <input
              type="text"
              placeholder="Section Name"
              className="w-full p-2 border rounded-md mb-2"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 border rounded-md mb-4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateSection} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sectionToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this section? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSectionToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseSidebar;