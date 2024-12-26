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
  List,
  ListItem,
  ListItemSuffix,
  IconButton,
} from "@material-tailwind/react";
import { LinkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

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
  const [ShowDetails, setShowDetails] = useState(false);

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

  // TrashIcon component
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="pt-4 w-64 bg-black text-white flex flex-col z-10">
        <div className="p-4 mb-5">
        <Button
          variant="gradient"
          color="green"
          type="button"
          onClick={handleCreateConnection}
          className="flex items-center gap-2"
        >
          <LinkIcon className="w-5 h-5" />
          Create Connection
        </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
        {connections.map((connection) => (
          <ListItem
            key={connection.connection_id}
            ripple={false}
            className="py-1 pr-1 pl-4 flex justify-between text-white items-center hover:bg-gray-700 cursor-pointer"
            onClick={() => handleConnectionClick(connection.connection_id)}
          >
            {connection.connection_name}
            <ListItemSuffix>
              <IconButton
                variant="text"
                color="red"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering onClick of the list item when clicking the trash icon
                  handleDeleteConnection(connection.connection_id);
                }}
              >
                <TrashIcon />
              </IconButton>
            </ListItemSuffix>
          </ListItem>
        ))}
        </div>
      </div>

<div className="flex-1 bg-white p-10 overflow-y-auto shadow-inner">
  <Typography
    variant="h3"
    className="mb-8 font-extrabold text-black text-4xl"
  >
    IoT Connect
  </Typography>
  {selectedConnection ? (
<Card className="shadow-lg hover:shadow-xl transition-shadow">
  <CardBody className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex flex-col w-3/4">
        <Typography
          variant="h5"
          className="font-bold text-black mb-4 text-xl"
        >
          {selectedConnection.connection_name}
        </Typography>
        <div className="flex flex-wrap items-center space-x-8">
          <Typography className="text-black text-base">
            <strong>Description:</strong> {selectedConnection.connection_description}
          </Typography>
          <Typography className="text-black text-base">
            <strong>URL:</strong> {selectedConnection.connection_url}
          </Typography>
          <Typography className="text-black text-base">
            <strong>Subscription Topic:</strong> {selectedConnection.subscribe_topic}
          </Typography>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <Button
          variant="gradient"
          color="black"
          className="text-white px-6 py-2"
        >
          Connect
        </Button>
        <div className="relative">
          <button
            className="p-3 rounded-full hover:bg-gray-200"
            onClick={() => setShowDetails(!ShowDetails)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v.01M12 12v.01M12 18v.01"
              />
            </svg>
          </button>
          {ShowDetails && (
            <div className="absolute right-0 mt-4 w-72 bg-white border rounded-lg shadow-lg p-4">
              <Typography className="text-black text-sm mb-3">
                <strong>Protocol:</strong> {selectedConnection.protocol}
              </Typography>
              <Typography className="text-black text-sm mb-3">
                <strong>Port:</strong> {selectedConnection.port}
              </Typography>
              <Typography className="text-black text-sm mb-3">
                <strong>QoS:</strong> {selectedConnection.qos}
              </Typography>
              <Typography className="text-black text-sm mb-3">
                <strong>Keep Alive:</strong> {selectedConnection.keep_alive}s
              </Typography>
              <Typography className="text-black text-sm mb-3">
                <strong>Username:</strong> {selectedConnection.username}
              </Typography>
              <Typography className="text-black text-sm mb-3">
                <strong>Connection Status:</strong> {selectedConnection.typeof_connection}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  </CardBody>
</Card>
  ) : (
    <Typography className="text-black text-center text-lg">
      Select a connection to view details.
    </Typography>
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
            color="black"
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