"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import socket from "../utils/socketClient";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const router = useRouter();

  useEffect(() => {
    // İlk bağlantıda sunucudan mevcut oda listesini iste
    socket.emit("getRooms");

    // Sunucudan güncel oda listesini dinle
    socket.on("rooms", (data) => setRooms(data));

    // Temizlik işlemi: bileşen kaldırıldığında dinleyiciyi kaldır
    return () => socket.off("rooms");
  }, []); // Bağımlılık dizisi boş bırakıldı (sadece bir kez çalışacak)

  const joinRoom = (roomId) => {
    router.push(`/game/${roomId}?username=${username}`);
  };

  const handleCreateRoom = () => {
    const roomName = prompt("Oda ismini girin:");
    const maxParticipants = prompt("Maksimum katılımcı sayısını girin:") || 10;

    if (roomName) {
      // Sunucuya yeni oda oluşturma isteği gönder
      socket.emit("createRoom", {
        name: roomName,
        maxParticipants: parseInt(maxParticipants),
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mevcut Odalar</h1>
      {rooms.length === 0 ? (
        <p>Şu anda hiç oda yok. Yeni bir oda oluşturabilirsiniz!</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="p-4 border rounded shadow cursor-pointer hover:bg-gray-100"
              onClick={() => joinRoom(room.id)}
            >
              <p>
                <strong>{room.name}</strong> (Katılımcılar:{" "}
                {room.participants.length} / {room.maxParticipants})
              </p>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleCreateRoom}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Yeni Oda Oluştur
      </button>
    </div>
  );
}
