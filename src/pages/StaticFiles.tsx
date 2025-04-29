import React, { useEffect, useState } from 'react';
import { FileEntry } from '../types';
import FileList from '../components/FileList';
import { Upload } from 'lucide-react';
import WarehouseSidebar from '../components/WarehouseSidebar';

const StaticFiles: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });
  const token = localStorage.getItem('authToken');
  
  const getHeaders = () => {
    return {
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    };
  };
  
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5001/services/WareHouse/getStaticFileList', {
        headers: getHeaders(),
      });
      const data = await response.json();
      setFiles(data.static_files || []);
    } catch (error) {
      console.error('Error fetching static files:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    setFileToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      await fetch(`http://localhost:5001/services/WareHouse/staticFile/delete/${fileToDelete}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setFileToDelete(null);
    }
  };
  
  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/services/WareHouse/getStaticFile/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5001/services/WareHouse/staticFile/upload', {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      if (response.ok) {
        await fetchFiles();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
    if (direction === null) {
      fetchFiles(); // Reset to original order
      return;
    }
    const sortedFiles = [...files].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFiles(sortedFiles);
  };
  
  useEffect(() => {
    fetchFiles();
  }, []);
  
  return (
    <div className="flex">
      <WarehouseSidebar />
      <div className="pl-64 flex-grow mt-14">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Static Files</h1>
              <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  accept=".xls,.xlsx,.pdf,.pkl,.docs,.txt,.sh,.bat"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <FileList
              onDownload={handleDownload}
              files={files}
              onDelete={handleDelete}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          </div>
          
          {/* Delete Confirmation Modal */}
          {fileToDelete && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setFileToDelete(null)}
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
      </div>
    </div>
  );
};

export default StaticFiles;