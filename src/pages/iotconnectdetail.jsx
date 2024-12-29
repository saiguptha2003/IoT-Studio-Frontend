import React, { useEffect, useState } from 'react';
import { Client } from 'paho-mqtt';
import { Spinner } from "@material-tailwind/react";

const Iotconnectdetail = ({ connection, startConnection }) => {
  const [messages, setMessages] = useState([]); // To store received messages
  const [viewMode, setViewMode] = useState('json'); // 'json' or 'table' view mode
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (startConnection) {
      setLoading(true);
      try {
        setError(null);
        setMessages([]);
        const brokerUrl = connection.connection_url; // Use connection URL from props
        const topic = connection.subscribe_topic; // Use topic from props
        const clientId = `mqttjs_${Math.random().toString(16).substr(2, 8)}`;

        // Create MQTT client
        const mqttClient = new Client(brokerUrl, clientId);

        mqttClient.onMessageArrived = (message) => {
          console.log('Message received:', message.payloadString);
          try {
            const jsonMessage = JSON.parse(message.payloadString);
            setMessages((prevMessages) => [jsonMessage, ...prevMessages]); // Add new message at the top
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        mqttClient.onConnectionLost = (responseObject) => {
          console.error('Connection lost:', responseObject.errorMessage);
          setError('Connection lost');
          setLoading(false);
        };

        mqttClient.connect({
          onSuccess: () => {
            console.log('Connected to MQTT broker');
            mqttClient.subscribe(topic, {
              onSuccess: () => {
                console.log(`Subscribed to topic: ${topic}`);
                setLoading(false);
              },
              onFailure: (err) => {
                console.error('Subscription failed:', err);
                setError('Subscription failed');
                setLoading(false);
              },
            });
          },
          onFailure: (err) => {
            console.error('Connection failed:', err);
            setError('Connection failed');
            setLoading(false);
          },
          useSSL: true, // Enable SSL for secure connection
        });

        setClient(mqttClient);
      } catch (err) {
        console.error('Error creating MQTT client:', err);
        setError('Error creating MQTT client');
        setLoading(false);
      }
    } else if (client && client.isConnected()) {
      client.disconnect();
      setClient(null);
      setMessages([]);
    }

    return () => {
      if (client && client.isConnected()) {
        client.disconnect();
      }
    };
  }, [startConnection, connection]);

  // Function to generate and download the JSON file
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mqtt_messages.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to generate and download the CSV file
  const downloadCSV = () => {
    const headers = Object.keys(messages[0] || {}).join(',');
    const rows = messages.map((msg) => Object.values(msg).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mqtt_messages.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center text-gray-800 p-5">
      <h1 className="text-2xl font-bold mb-6">MQTT Subscriber</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <Spinner color="black" className="mb-4" />}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setViewMode('json')}
          className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          JSON View
        </button>
        <button
          onClick={() => setViewMode('table')}
          className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Table View
        </button>
        <button
          onClick={downloadJSON}
          className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Download JSON
        </button>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Download CSV
        </button>
      </div>
      <div className="w-4/5 max-h-96 overflow-y-auto border border-gray-300 rounded-lg bg-white p-4">
        {viewMode === 'json' ? (
          messages.length === 0 ? (
            <p className="text-center">No messages received</p>
          ) : (
            messages.map((msg, index) => (
              <pre key={index} className="text-sm text-gray-700">
                {JSON.stringify(msg, null, 2)}
              </pre>
            ))
          )
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {messages.length > 0 &&
                  Object.keys(messages[0]).map((key) => (
                    <th key={key} className="border border-gray-300 px-4 py-2 text-left">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={index} className="even:bg-gray-100">
                  {Object.values(msg).map((value, idx) => (
                    <td key={idx} className="border border-gray-300 px-4 py-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Iotconnectdetail;
