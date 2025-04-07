const TokenTable1 = ({ tokens, onDelete }) => {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-5">
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
                    {tokens.map((token) => (
                        <tr key={token.id} className="border border-gray-200">
                            <td className="border border-gray-300 px-4 py-2">{token.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.id}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.description}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.creationDate}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.expiryDate}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                    onClick={() => onDelete(token.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TokenTable1;

