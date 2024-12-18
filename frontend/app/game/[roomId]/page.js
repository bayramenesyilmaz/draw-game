"use client";
import { useEffect, useRef, useState } from "react";
import Canvas from "../../../components/Canvas";
import ChatBox from "../../../components/ChatBox";
import { useParams, useSearchParams } from "next/navigation";
import socket from "@/app/utils/socketClient";

export default function Game() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const ansBoxRef = useRef(null);
  const username = searchParams.get("username");

  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [participants, setParticipants] = useState([]); // Katılımcıları takip etmek için

  useEffect(() => {
    // Kullanıcı odaya katıldığında sunucuya bilgi gönder
    if (roomId && username) {
      socket.emit("joinRoom", { roomId, username });

      // Oyun bilgilerini al (çizen kişi ve katılımcılar)
      socket.on("gameInfo", (data) => {
        setRoomName(data.roomName);
        setParticipants(data.participants);
        setIsDrawing(data.drawer === username); // Çizen kullanıcıyı belirle
      });

      // Yeni cevapları dinle
      socket.on("newAnswer", (data) => {
        setAnswers((prev) => [...prev, `${data.username}: ${data.answer}`]);
      });

      // Çizim olaylarını dinle
      socket.on("draw", (data) => {
        // Çizim verisini güncelle
      });
      // Oda veya socket temizlik işlemi
      return () => {
        // if (roomId && username) {
        //   socket.emit("leaveRoom", { roomId, username });
        // }

        socket.off("newAnswer");
        socket.off("draw");
        socket.off("participants");
      };
    }
  }, []);

  useEffect(() => {
    // Yeni mesaj geldiğinde sohbet kutusunu otomatik kaydır
    if (ansBoxRef.current) {
      ansBoxRef.current.scrollTop = ansBoxRef.current.scrollHeight;
    }
  }, [answers]);

  // Cevap gönderme işlemi
  const submitAnswer = (e) => {
    e.preventDefault();

    if (answer.trim()) {
      socket.emit("submitAnswer", { roomId, username, answer });
      setAnswer("");
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Oda Başlığı */}
      <div className="flex gap-1 md:flex-row flex-col items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Oda: {roomName}</h1>
        <h3 className="text-sm md:text-lg">Oda ID: {roomId}</h3>
      </div>

      {/* Ana İçerik */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Canvas Bileşeni */}
        <div className="border rounded-md shadow-md">
          <Canvas socket={socket} roomId={roomId} isDrawing={isDrawing} />
        </div>

        {/* Cevaplar Bölümü */}
        <div className="w-full md:flex-1 flex flex-col border p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cevaplar</h2>
          <ul
            ref={ansBoxRef}
            className="flex-1 overflow-y-auto border p-2 rounded max-h-[150px] md:max-[250px] overflow-auto"
          >
            {answers.map((ans, index) => (
              <li key={index} className="py-1 text-gray-700">
                {ans}
              </li>
            ))}
          </ul>
          <form onSubmit={submitAnswer} className="flex flex-col gap-2 mt-4">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Cevap yaz..."
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>

      {/* ChatBox Bileşeni */}
      <div className="mt-6 border p-4 rounded-md shadow-md">
        <h3 className="text-xl font-semibold mb-2">Sohbet</h3>
        <ChatBox socket={socket} roomId={roomId} username={username} />
      </div>

      {/* Katılımcı Listesi */}
      <div className="mt-6 p-4 rounded-md shadow-md bg-gray-50">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Katılımcılar
        </h3>
        <ul className="list-disc list-inside text-gray-600">
          {participants.map((participant, index) => (
            <li key={index} className="py-1">
              {participant}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
