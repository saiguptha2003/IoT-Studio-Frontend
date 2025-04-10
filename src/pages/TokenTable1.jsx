import { useState, useEffect } from 'react';

const TokenTable1 = ({ tokens, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(tokens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTokens = tokens.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [tokens, currentPage, totalPages]);

  const handleRowClick = async (id) => {
    console.log("Row clicked:", id);

    const token = localStorage.getItem('authToken'); // ✅ Auth token
    if (!token) {
      console.error('No auth token found');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5001/services/SecureStore/getSecureToken/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ Auth header
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("Fetch failed");

      const data = await response.json();
      console.log("Fetched token data:", data);
      setSelectedToken(data.token);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching token details:', error);
    }
  };

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
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Creation Date</th>
              <th className="border border-gray-300 px-4 py-2">Expiry Date</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTokens.map((token) => (
              <tr key={token.id} className="border border-gray-200 hover:bg-gray-100">
                <td
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleRowClick(token.id)}
                >
                  {token.name || token.token_name}
                </td>
                <td
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleRowClick(token.id)}
                >
                  {token.id}
                </td>
                <td
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleRowClick(token.id)}
                >
                  {token.description}
                </td>
                <td
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleRowClick(token.id)}
                >
                  {token.creationDate}
                </td>
                <td
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleRowClick(token.id)}
                >
                  {token.expiryDate}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      onDelete(token.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-center w-full sm:justify-center">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-1 rounded-full ${
                  currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder="Page"
            className="border border-gray-300 rounded px-3 py-1 w-24 text-center"
          />
          <button
            onClick={handleGoToPage}
            className="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <h2 className="text-xl font-bold mb-4">Token Details</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>Name:</strong> {selectedToken.token_name}</li>
              <li><strong>ID:</strong> {selectedToken.id}</li>
              <li><strong>Description:</strong> {selectedToken.description}</li>
              <li><strong>Type:</strong> {selectedToken.type_of_token}</li>
              <li><strong>nbytes:</strong> {selectedToken.nbytes}</li>
              <li><strong>Token:</strong> <span className="break-all">{selectedToken.token}</span></li>
              <li><strong>Created At:</strong> {selectedToken.created_at}</li>
              <li><strong>Expires At:</strong> {selectedToken.expire_date_time}</li>
            </ul>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenTable1;
