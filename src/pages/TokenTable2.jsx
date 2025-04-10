import { useState, useEffect } from 'react';

const TokenTable2 = ({ tokens, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('');
  const itemsPerPage = 5;

  // Calculate pagination values
  const totalPages = Math.ceil(tokens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTokens = tokens.slice(startIndex, startIndex + itemsPerPage);

  // Reset to last page if items are deleted
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [tokens, currentPage, totalPages]);

  // Generate page numbers with ellipsis logic
  const generatePageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Handle page jump input
  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputPage('');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-5">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2">Secure ID Name</th>
              <th className="border border-gray-300 px-4 py-2">Secure ID</th>
              <th className="border border-gray-300 px-4 py-2">Type of ID</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTokens.map((token) => (
              <tr key={token.id} className="border border-gray-200">
                <td className="border border-gray-300 px-4 py-2">{token.secureid_name}</td>
                <td className="border border-gray-300 px-4 py-2">{token.secure_id}</td>
                <td className="border border-gray-300 px-4 py-2">{token.type_of_id}</td>
                <td className="border border-gray-300 px-4 py-2">{token.description}</td>
                <td className="border border-gray-300 px-4 py-2">{token.created_at}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex justify-center items-center">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      onClick={() => onDelete(token.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Centered Page Navigation */}
        <div className="flex justify-center w-full">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {generatePageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="px-3 py-1 text-gray-500">
                  {page}
                </span>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right-Aligned Page Jump */}
        <div className="flex justify-end">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              placeholder="Page"
              className="border border-gray-300 rounded-lg px-3 py-1 w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleGoToPage}
              className="px-4 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenTable2;
