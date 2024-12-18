"use client";
import { useEffect, useState, useRef } from "react";

export default function ChatBox({ socket, roomId, username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Sunucudan gelen mesajları dinle
    socket.on("chatMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Temizleme işlemi
    return () => {
      socket.off("chatMessage");
    };
  }, [socket]);

  useEffect(() => {
    // Yeni mesaj geldiğinde sohbet kutusunu otomatik kaydır
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      // Mesajı sunucuya gönder
      socket.emit("sendMessage", { roomId, username, message });

      // // Kendi mesajını ekrana ekle
      // setMessages((prevMessages) => [
      //   ...prevMessages,
      //   { username, message }, // Kendi mesajını da ekliyoruz
      // ]);

      setMessage(""); // Mesaj kutusunu temizle
    }
  };

  return (
    <div className="w-full border p-4 rounded shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Sohbet</h2>
      {/* Sohbet kutusu */}
      <div
        ref={chatBoxRef}
        className="h-64 overflow-y-auto mb-4 border p-2 rounded bg-gray-100"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.username === username ? "text-blue-600" : "text-black"
            }`}
          >
            <span className="font-bold">{msg.username}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      {/* Mesaj gönderme alanı */}
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="Mesaj yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600 transition"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
