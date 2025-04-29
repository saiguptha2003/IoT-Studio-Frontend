import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your AI assistant! How can I help you today?",
      sender: "bot",
      direction: "incoming",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing",
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      // Demo backend URL - replace with your actual backend
      const response = await fetch("https://api.example.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }).catch(() => {
        // Demo response if API fails
        return {
          ok: true,
          json: () => Promise.resolve({ 
            reply: "This is a demo response. Please connect to a real backend API." 
          })
        };
      });

      const data = await response.json();
      
      const botResponse = {
        message: data.reply,
        sender: "bot",
        direction: "incoming",
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        message: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        direction: "incoming",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] z-50 rounded-lg shadow-xl">
          <div style={{ height: '100%' }} className="flex flex-col rounded-lg bg-white overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 bg-blue-600 text-white">
              <h4 className="text-lg font-semibold">Chat Assistant</h4>
              <button onClick={toggleChat}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Container */}
            <div style={{ height: 'calc(100% - 56px)' }}>
              <MainContainer style={{ height: '100%' }}>
                <ChatContainer style={{ height: '100%' }}>
                  <MessageList 
                    style={{ 
                      backgroundColor: '#fff',
                      padding: '1rem',
                    }}
                    scrollBehavior="smooth"
                    typingIndicator={loading && <TypingIndicator content="AI is thinking..." />}
                  >
                    {messages.map((message, i) => (
                      <Message
                        key={i}
                        model={{
                          message: message.message,
                          sender: message.sender,
                          direction: message.direction,
                          position: "single",
                        }}
                      />
                    ))}
                  </MessageList>
                  <MessageInput 
                    placeholder="Type your message here..."
                    onSend={handleSend}
                    attachButton={false}
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      backgroundColor: '#fff',
                      borderTop: '1px solid #e5e7eb',
                      padding: '0.75rem',
                    }}
                  />
                </ChatContainer>
              </MainContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
