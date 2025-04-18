import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./static/Home.css";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || JSON.parse(sessionStorage.getItem("user")); // Get user data from sessionStorage if available

  const [messages, setMessages] = useState([]); // Track messages sent and received
  const [userMessage, setUserMessage] = useState(""); // User's input message
  const [loading, setLoading] = useState(false); // Track if the bot is replying

  const handleSignOut = () => {
    // Clear session storage and redirect to login page
    sessionStorage.removeItem("user");
    navigate("/"); // Redirect to the login page or homepage
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleSendMessage = async () => {
    if (userMessage.trim() === "") return; // Avoid sending empty messages

    // Add the user's message to chat
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setUserMessage(""); // Clear input field
    setLoading(true); // Show loading state while waiting for the bot response

    try {
      // Send message to backend for processing
      const response = await axios.post("http://localhost:8081/api/message", {
        message: userMessage,
      });

      // Add bot response to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    }

    setLoading(false); // Hide loading state
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="button-group">
          <button className="back-btn" onClick={handleBack}>← Back</button>
          <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      

      {user ? (
        <div className="user-inf">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.image && (
            <div className="user-image-container">
              <img 
                src={`http://localhost:8081/uploads/${user.image}`} 
                alt="Profile" 
                className="user-image" 
              />
            </div>
          )}
        </div>
    
      ) : (
        <p>User data not available try again please...</p>
      )}
</div>
      {/* Chat Section */}
      <div className="chat-container">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "user" ? "user-message" : "bot-message"}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div className="loading-message">Bot is typing...</div>}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button onClick={handleSendMessage} className="chat-send-button">Send</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
