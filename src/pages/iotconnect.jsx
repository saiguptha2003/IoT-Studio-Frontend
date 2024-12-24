import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/solid";

const IoTConnect = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null); // Track selected connection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({
    connection_name: "",
    connection_description: "",
    protocol: "mqtt",
    connection_url: "",
    port: 0,
    subscribe_topic: "",
    qos: 0,
    keep_alive: 0,
    authenticated_broker: false,
    username: "",
    password: "",
    typeof_connection: "online",
  });

  useEffect(() => {
    if (!authToken) {
      navigate("/sign-in");
    }
  }, [authToken, navigate]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/services/IotConnect/getAllIoTConnections`, {
          method: "GET",
          headers: {
            "Authorization": authToken,
          },
        });

        const result = await response.json();
        if (response.ok) {
          setConnections(result);
        } else {
          alert(result.message || "Failed to fetch connections");
        }
      } catch (error) {
        console.error("Error fetching IoT connections:", error);
        alert("An error occurred. Please try again.");
      }
    };

    fetchConnections();
  }, [authToken]);

  const handleConnectionClick = async (connectionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/IotConnect/getConnectionById/${connectionId}`, {
        method: "GET",
        headers: {
          "Authorization": authToken,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setSelectedConnection(result);
      } else {
        alert(result.message || "Failed to fetch connection details");
      }
    } catch (error) {
      console.error("Error fetching connection details:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCreateConnection = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConnection({ ...newConnection, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/IotConnect/createServiceConnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authToken,
        },
        body: JSON.stringify(newConnection),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Connection created successfully!");
        setConnections(result.IoTConnect);
      } else {
        alert(result.message || "Failed to create connection");
      }
    } catch (error) {
      console.error("Error creating connection:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsModalOpen(false);
    }
  };

    const handleDeleteConnection = async (connectionId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/services/IotConnect/deleteServiceConnect/${connectionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authToken,
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setConnections(connections.filter((conn) => conn.connection_id !== connectionId));
        setSelectedConnection(null);
      } else {
        alert(result.message || "Failed to delete connection");
      }
    } catch (error) {
      console.error("Error deleting connection:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="pt-4 w-64 bg-black text-white flex flex-col z-10">
        <div className="p-4 mb-5">
          <Button variant="gradient" color="green" type="button" onClick={handleCreateConnection}>
            Create Connection
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {connections.map((connection) => (
            <div
              key={connection.connection_id}
              onClick={() => handleConnectionClick(connection.connection_id)}
              className="cursor-pointer p-4 border-b border-gray-700 flex justify-between items-center hover:bg-gray-700"
            >
              <span
                className="cursor-pointer"
              >
                {connection.connection_name}
              </span>
                <TrashIcon
                  className="w-6 h-6 text-red-500 cursor-pointer transform transition-transform duration-300 hover:scale-125"
                  onClick={() => handleDeleteConnection(connection.connection_id)}
                />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
        <Typography variant="h3" className="mb-6 font-bold text-gray-800">
          IoT Connect
        </Typography>
        {selectedConnection ? (
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody>
              <Typography variant="h5" className="font-bold text-black mb-3">
                {selectedConnection.connection_name}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Description: {selectedConnection.connection_description}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Protocol: {selectedConnection.protocol}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Port: {selectedConnection.port}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                QoS: {selectedConnection.qos}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Keep Alive: {selectedConnection.keep_alive}s
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Username: {selectedConnection.username}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Topic: {selectedConnection.subscribe_topic}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                Connection Status: {selectedConnection.typeof_connection}
              </Typography>
              <Button
                variant="filled"
                color="black"
                className="text-white hover:bg-black"
              >
                Manage
              </Button>
            </CardBody>
          </Card>
        ) : (
          <Typography className="text-gray-700">Select a connection to view details.</Typography>
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} handler={handleCloseModal} className="z-50">
        <DialogHeader>Create a New Connection</DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Connection Name"
              name="connection_name"
              value={newConnection.connection_name}
              onChange={handleInputChange}
            />
            <Input
              label="Description"
              name="connection_description"
              value={newConnection.connection_description}
              onChange={handleInputChange}
            />
            <Input
              label="Protocol"
              name="protocol"
              value={newConnection.protocol}
              onChange={handleInputChange}
            />
            <Input
              label="Connection URL"
              name="connection_url"
              value={newConnection.connection_url}
              onChange={handleInputChange}
            />
            <Input
              label="Port"
              type="number"
              name="port"
              value={newConnection.port}
              onChange={handleInputChange}
            />
            <Input
              label="Subscribe Topic"
              name="subscribe_topic"
              value={newConnection.subscribe_topic}
              onChange={handleInputChange}
            />
            <Input
              label="QoS"
              type="number"
              name="qos"
              value={newConnection.qos}
              onChange={handleInputChange}
            />
            <Input
              label="Keep Alive (seconds)"
              type="number"
              name="keep_alive"
              value={newConnection.keep_alive}
              onChange={handleInputChange}
            />
            <Input
              label="Username"
              name="username"
              value={newConnection.username}
              onChange={handleInputChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={newConnection.password}
              onChange={handleInputChange}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue"
            onClick={handleCloseModal}
            className="mr-1"
          >
            Close
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleSubmit}
          >
            Create Connection
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default IoTConnect;
