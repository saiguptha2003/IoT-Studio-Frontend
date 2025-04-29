import React from 'react';
import { Trash2, ArrowDownAZ, Download } from 'lucide-react';
import { FileEntry } from '../types.ts';

interface FileListProps {
  files: FileEntry[];
  onDelete: (id: string) => void;
  onDownload?: (id: string) => void;
  onSort: (key: string) => void;
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc' | null;
  };
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, onDownload, onSort, sortConfig }) => {
  const getSortIconColor = (columnKey: string) => {
    return sortConfig.key === columnKey && sortConfig.direction !== null
      ? 'text-green-500'
      : 'text-gray-400';
  };

  const renderSortIcon = (columnKey: string) => {
    return (
      <ArrowDownAZ
        className={`inline-block ml-1 h-4 w-4 cursor-pointer ${getSortIconColor(columnKey)} 
          ${sortConfig.key === columnKey && sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`}
        onClick={() => onSort(columnKey)}
      />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filename {renderSortIcon('filename')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp {renderSortIcon('timeStamp')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.uuid} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {file.filename}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.timeStamp || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {onDownload && (
                  <button
                    onClick={() => onDownload(file.uuid)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                     <Download className="h-4 w-4 mr-2" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(file.uuid)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">No files found</div>
      )}
    </div>
  );
};

export default FileList