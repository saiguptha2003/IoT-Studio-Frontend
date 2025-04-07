const TokenTable2 = ({ tokens, onDelete }) => {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-5">
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
                    {tokens.map((token) => (
                        <tr key={token.id} className="border border-gray-200">
                            <td className="border border-gray-300 px-4 py-2">{token.secureid_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.secure_id}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.type_of_id}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.description}</td>
                            <td className="border border-gray-300 px-4 py-2">{token.created_at}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
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

export default TokenTable2;
