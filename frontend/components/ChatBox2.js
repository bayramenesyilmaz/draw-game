"use client";

import { GameContext } from "@/app/context/socketProvider";
import React, { useContext, useState } from "react";

export default function ChatBox({ messages }) {
  const [message, setMessage] = useState("");
  const { socket, currentRoom, username } = useContext(GameContext);

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { roomId: currentRoom, username, message });
      setMessage("");
    }
  };

  return (
    <div>
      <div className="overflow-y-scroll h-96 p-2 border rounded">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong>{msg.message}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleSendMessage}
          className="mt-2 p-2 bg-blue-500 text-white rounded w-full"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
