import React, { useEffect, useState } from 'react';
import { ArrowDownAZ, Download } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import WarehouseSidebar from '../components/WarehouseSidebar';

interface TriggerFile {
  trigger_id: string;
  trigger_name: string;
  created_at: string;
  file_path: string;
}

type SortField = 'trigger_name' | 'created_at' | 'file_path';
type SortDirection = 'asc' | 'desc';

const TriggerFiles: React.FC = () => {
  const [files, setFiles] = useState<TriggerFile[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const token = localStorage.getItem('authToken');
  const getHeaders = () => {
    return {
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5001/services/WareHouse/getTriggerFilesList', {
        headers: getHeaders(),
      });
      const data = await response.json();
      setFiles(data.trigger_files || []);
    } catch (error) {
      console.error('Error fetching trigger files:', error);
    }
  };

  const handleDelete = async (triggerId: string) => {
    setFileToDelete(triggerId);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await fetch(`http://localhost:5001/services/WareHouse/deleteTrigger/${fileToDelete}`, {
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

  const handleDownload = async (triggerId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/services/WareHouse/getTriggerFile/${triggerId}`, {
        headers: getHeaders(),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trigger-${triggerId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'trigger_name':
        return direction * a.trigger_name.localeCompare(b.trigger_name);
      case 'created_at':
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'file_path':
        return direction * ((a.file_path || '').localeCompare(b.file_path || ''));
      default:
        return 0;
    }
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="flex">
      <WarehouseSidebar />
      <div className="pl-64 flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Trigger Files</h1>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('trigger_name')}
                    >
                      <div className="flex items-center">
                        Name
                        <ArrowDownAZ 
                          className={`ml-2 h-4 w-4 ${
                            sortField === 'trigger_name' 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          } ${
                            sortField === 'trigger_name' && sortDirection === 'desc' 
                              ? 'transform rotate-180' 
                              : ''
                          }`}
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Created At
                        <ArrowDownAZ 
                          className={`ml-2 h-4 w-4 ${
                            sortField === 'created_at' 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          } ${
                            sortField === 'created_at' && sortDirection === 'desc' 
                              ? 'transform rotate-180' 
                              : ''
                          }`}
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('file_path')}
                    >
                      <div className="flex items-center">
                        File Path
                        <ArrowDownAZ 
                          className={`ml-2 h-4 w-4 ${
                            sortField === 'file_path' 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          } ${
                            sortField === 'file_path' && sortDirection === 'desc' 
                              ? 'transform rotate-180' 
                              : ''
                          }`}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedFiles.map((file) => (
                    <tr key={file.trigger_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{file.trigger_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(file.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="text-sm text-gray-500 truncate max-w-xs"
                          title={file.file_path || 'Trigger is not executed, just created'}
                        >
                          {file.file_path || 'Trigger is not executed, just created'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {file.file_path && (
                          <button
                            onClick={() => handleDownload(file.trigger_id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                             <Download className="h-4 w-4 mr-2" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(file.trigger_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {files.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No trigger files found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {fileToDelete && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete this trigger file? This action cannot be undone.
                </p>
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

export default TriggerFiles;