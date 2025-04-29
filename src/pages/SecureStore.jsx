import React, { useState, useEffect } from "react";
import axios from "axios";
import TokenTable1 from "./TokenTable1";
import TokenTable2 from "./TokenTable2";

function SecureStore() {
    const [tokenSearch, setTokenSearch] = useState("");
    const [secureIdSearch, setSecureIdSearch] = useState("");
    const [tokens, setTokens] = useState([]);
    const [filteredTokens, setFilteredTokens] = useState([]);
    const [secureIds, setSecureIds] = useState([]);
    const [filteredSecureIds, setFilteredSecureIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Delete modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    
    // Create token modal state
    const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
    const [newToken, setNewToken] = useState({
        token_name: '',
        description: '',
        type_of_token: 'hex',
        expire_date_time: '',
        nbytes: 32,
    });
    const [createError, setCreateError] = useState('');

    // Create Secure ID modal state
    const [isCreateSecureIdModalOpen, setIsCreateSecureIdModalOpen] = useState(false);
    const [newSecureId, setNewSecureId] = useState({
        secureid_name: '',
        description: '',
        type_of_id: 'int',
    });
    const [createSecureIdError, setCreateSecureIdError] = useState('');

    const auth = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:5001/services/SecureStore/getAllSecureTokens",
                    { headers: { Authorization: `Bearer ${auth}` } }
                );

                const backendTokens = response.data.map((token) => {
                    const formatTimestamp = (timestamp) => {
                        const date = new Date(parseFloat(timestamp) * 1000);
                        return date.toISOString().replace("T", " ").split(".")[0]; // "YYYY-MM-DD HH:mm:ss"
                    };

                    return {
                        name: token.token_name,
                        id: token.id,
                        description: token.description,
                        creationDate: formatTimestamp(token.created_at),
                        expiryDate: formatTimestamp(token.expire_date_time),
                        nBytes: token.nbytes,
                    };
                });

                setTokens(backendTokens);
                setFilteredTokens(backendTokens);
            } catch (error) {
                console.error("Error fetching tokens:", error);
                setError("Failed to load tokens");
            }
        };

        const fetchSecureIds = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:5001/services/SecureStore/getAllSecureIDs",
                    { headers: { Authorization: `Bearer ${auth}` } }
                );

                const secureIdsData = response.data.map((token) => ({
                    secureid_name: token.secureid_name,
                    secure_id: token.secure_id,
                    type_of_id: token.type_of_id,
                    description: token.description,
                    created_at: token.created_at.split(" ")[0],
                    id: token.id,
                }));
                
                setSecureIds(secureIdsData);
                setFilteredSecureIds(secureIdsData);
            } catch (error) {
                console.error("Error fetching secure IDs:", error);
                setError("Failed to load secure IDs");
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
        fetchSecureIds();
    }, []);

    useEffect(() => {
        setFilteredTokens(
            tokens.filter(
                (token) =>
                    token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
                    token.id.toLowerCase().includes(tokenSearch.toLowerCase())
            )
        );
    }, [tokenSearch, tokens]);

    useEffect(() => {
        setFilteredSecureIds(
            secureIds.filter(
                (id) =>
                    id.secureid_name.toLowerCase().includes(secureIdSearch.toLowerCase()) ||
                    id.secure_id.toLowerCase().includes(secureIdSearch.toLowerCase())
            )
        );
    }, [secureIdSearch, secureIds]);

    const openDeleteModal = (id, type) => {
        setItemToDelete(id);
        setDeleteType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
    };

    const deleteItem = async () => {
        if (!itemToDelete || !deleteType) return;

        const url =
            deleteType === "token"
                ? `http://127.0.0.1:5001/services/SecureStore/deleteSecureToken/${itemToDelete}`
                : `http://127.0.0.1:5001/services/SecureStore/deleteSecureID/${itemToDelete}`;

        try {
            await axios.delete(url, { headers: { Authorization: `Bearer ${auth}` } });

            if (deleteType === "token") {
                setTokens(tokens.filter((token) => token.id !== itemToDelete));
                setFilteredTokens(filteredTokens.filter((token) => token.id !== itemToDelete));
            } else {
                setSecureIds(secureIds.filter((id) => id.id !== itemToDelete));
                setFilteredSecureIds(filteredSecureIds.filter((id) => id.id !== itemToDelete));
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item. Please try again.");
        } finally {
            closeModal();
        }
    };

    const handleCreateToken = async (e) => {
        e.preventDefault();
        try {
            // Validate required fields
            if (!newToken.token_name.trim()) {
                setCreateError('Token name is required');
                return;
            }
            if (!newToken.description.trim()) {
                setCreateError('Description is required');
                return;
            }
            if (!newToken.expire_date_time) {
                setCreateError('Expiry date and time is required');
                return;
            }

            // Validate that expiry date is in the future
            const expiryDate = new Date(newToken.expire_date_time);
            if (isNaN(expiryDate.getTime())) {
                setCreateError('Invalid expiry date format');
                return;
            }
            
            if (expiryDate <= new Date()) {
                setCreateError('Expiry date must be in the future');
                return;
            }

            const payload = {
                ...newToken,
                expire_date_time: newToken.expire_date_time,
                nbytes: parseInt(newToken.nbytes),
                type_of_token: newToken.type_of_token || 'hex'
            };

            const response = await axios.post(
                "http://127.0.0.1:5001/services/SecureStore/createSecureToken",
                payload,
                { headers: { Authorization: `Bearer ${auth}` } }
            );

            const createdToken = {
                name: response.data.entry.token_name,
                id: response.data.entry.id,
                description: response.data.entry.description,
                creationDate: new Date(parseFloat(response.data.entry.created_at) * 1000)
                    .toISOString()
                    .split("T")[0],
                expiryDate: response.data.entry.expire_date_time.split("T")[0],
                nBytes: response.data.entry.nbytes,
            };

            setTokens([...tokens, createdToken]);
            setFilteredTokens([...filteredTokens, createdToken]);
            setIsCreateTokenModalOpen(false);
            setNewToken({
                token_name: '',
                description: '',
                type_of_token: 'hex',
                expire_date_time: '',
                nbytes: 32,
            });
            setCreateError('');
        } catch (error) {
            console.error("Error creating token:", error);
            setCreateError(error.response?.data?.error || 'Failed to create token. Please try again.');
        }
    };

    const handleCreateSecureId = async (e) => {
        e.preventDefault();
        try {
            // Validate required fields
            if (!newSecureId.secureid_name.trim()) {
                setCreateSecureIdError('Secure ID name is required');
                return;
            }
            if (!newSecureId.description.trim()) {
                setCreateSecureIdError('Description is required');
                return;
            }

            const response = await axios.post(
                "http://127.0.0.1:5001/services/SecureStore/createSecureId",
                newSecureId,
                { headers: { Authorization: `Bearer ${auth}` } }
            );

            const createdSecureId = {
                secureid_name: response.data.entry.secureid_name,
                secure_id: response.data.entry.secure_id,
                type_of_id: response.data.entry.type_of_id,
                description: response.data.entry.description,
                created_at: response.data.entry.created_at.split(" ")[0],
                id: response.data.entry.id,
            };

            setSecureIds([...secureIds, createdSecureId]);
            setFilteredSecureIds([...filteredSecureIds, createdSecureId]);
            setIsCreateSecureIdModalOpen(false);
            setNewSecureId({
                secureid_name: '',
                description: '',
                type_of_id: 'int',
            });
            setCreateSecureIdError('');
        } catch (error) {
            console.error("Error creating secure ID:", error);
            setCreateSecureIdError(error.response?.data?.error || 'Failed to create secure ID. Please try again.');
        }
    };

    return (
        <div className="relative w-full h-screen flex flex-col space-y-10 p-10">
            {/* Token Table */}
            <div className="bg-white shadow-md rounded-lg p-6 mt-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Secure Tokens</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={tokenSearch}
                            onChange={(e) => setTokenSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            onClick={() => setIsCreateTokenModalOpen(true)}
                        >
                            Create Token
                        </button>
                    </div>
                </div>
                <TokenTable1 tokens={filteredTokens} onDelete={(id) => openDeleteModal(id, "token")} />
            </div>

            {/* Secure ID Table */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Secure IDs</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Search secure IDs..."
                            value={secureIdSearch}
                            onChange={(e) => setSecureIdSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            onClick={() => setIsCreateSecureIdModalOpen(true)}
                        >
                            Create Secure ID
                        </button>
                    </div>
                </div>
                <TokenTable2 tokens={filteredSecureIds} onDelete={(id) => openDeleteModal(id, "secureId")} />
            </div>

            {/* Create Token Modal */}
            {isCreateTokenModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create New Token</h2>
                        {createError && <p className="text-red-500 mb-4">{createError}</p>}
                        <form onSubmit={handleCreateToken}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Token Name</label>
                                <input
                                    type="text"
                                    name="token_name"
                                    value={newToken.token_name}
                                    onChange={(e) => setNewToken({...newToken, token_name: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={newToken.description}
                                    onChange={(e) => setNewToken({...newToken, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Token Type</label>
                                <select
                                    name="type_of_token"
                                    value={newToken.type_of_token}
                                    onChange={(e) => setNewToken({...newToken, type_of_token: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="hex">Hex</option>
                                    <option value="base64">Base64</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Expiry Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="expire_date_time"
                                    value={newToken.expire_date_time}
                                    onChange={(e) => setNewToken({...newToken, expire_date_time: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Number of Bytes</label>
                                <input
                                    type="number"
                                    name="nbytes"
                                    value={newToken.nbytes}
                                    onChange={(e) => setNewToken({...newToken, nbytes: parseInt(e.target.value)})}
                                    min="1"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateTokenModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Secure ID Modal */}
            {isCreateSecureIdModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create New Secure ID</h2>
                        {createSecureIdError && <p className="text-red-500 mb-4">{createSecureIdError}</p>}
                        <form onSubmit={handleCreateSecureId}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Secure ID Name</label>
                                <input
                                    type="text"
                                    name="secureid_name"
                                    value={newSecureId.secureid_name}
                                    onChange={(e) => setNewSecureId({...newSecureId, secureid_name: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={newSecureId.description}
                                    onChange={(e) => setNewSecureId({...newSecureId, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">ID Type</label>
                                <select
                                    name="type_of_id"
                                    value={newSecureId.type_of_id}
                                    onChange={(e) => setNewSecureId({...newSecureId, type_of_id: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="int">Integer</option>
                                    <option value="string">String</option>
                                    <option value="uuid">UUID</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateSecureIdModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold">Confirm Delete</h2>
                        <p className="mt-2">
                            Are you sure you want to delete this{" "}
                            {deleteType === "token" ? "token" : "secure ID"}?
                        </p>
                        <div className="mt-4 flex justify-end space-x-4">
                            <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={deleteItem}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SecureStore;
