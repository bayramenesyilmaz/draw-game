import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://192.168.1.13:3001");
const GameContext = createContext();

export function GameProvider({ children }) {
  const [username, setUsername] = useState("");
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([]);

  // Backend'den odaları al
  useEffect(() => {
    socket.on("rooms", (updatedRooms) => {
      setRooms(updatedRooms);
    });

    socket.emit("getRooms");

    return () => {
      socket.off("rooms");
    };
  }, []);

  // Odaya katıldığında, room bilgilerini güncelle
  useEffect(() => {
    if (currentRoom) {
      socket.on("gameInfo", (gameInfo) => {
        setDrawer(gameInfo.drawer);
        setParticipants(gameInfo.participants);
        setMessages(gameInfo.messages);
        setAnswers(gameInfo.answers);
      });

      return () => {
        socket.off("gameInfo");
      };
    }
  }, [currentRoom]);

  // Odaya katılma fonksiyonu
  const joinRoom = (roomId, username) => {
    socket.emit("joinRoom", { roomId, username });
    setUsername(username);
    setCurrentRoom(roomId);
  };

  return (
    <GameContext.Provider
      value={{
        username,
        setUsername,
        rooms,
        setRooms,
        currentRoom,
        setCurrentRoom,
        drawer,
        setDrawer,
        participants,
        setParticipants,
        answers,
        setAnswers,
        messages,
        setMessages,
        socket,
        joinRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
