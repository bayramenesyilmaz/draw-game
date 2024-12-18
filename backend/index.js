const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Frontend adresi
    methods: ["GET", "POST"],
  },
});

// Oda verilerini tutmak için
let rooms = {};

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı:", socket.id);

  // Kullanıcı mevcut odaları istemişse
  socket.on("getRooms", () => {
    socket.emit("rooms", Object.values(rooms));
  });

  // Yeni bir oda oluştur
  socket.on("createRoom", ({ name, maxParticipants }) => {
    const roomId = `room_${Date.now()}`;
    rooms[roomId] = {
      id: roomId,
      name,
      participants: [],
      maxParticipants,
      drawer: null, // Çizen kişi
      messages: [],
      answers: [],
    };

    console.log(`Yeni oda oluşturuldu: ${name} (${roomId})`);
    io.emit("rooms", Object.values(rooms)); // Tüm istemcilere güncellemeyi gönder
  });

  // Bir odaya katıl
  socket.on("joinRoom", ({ roomId, username }) => {
    if (rooms[roomId]) {
      // Kullanıcı zaten katılmış mı kontrol et
      const isAlreadyInRoom = rooms[roomId].participants.some(
        (user) => user.username === username
      );
      if (isAlreadyInRoom) {
        console.log(`${username} zaten odaya katılmış: ${roomId}`);
        return;
      }

      // Oda doluluk kontrolü
      if (rooms[roomId].participants.length >= rooms[roomId].maxParticipants) {
        socket.emit("roomFull", { message: "Oda dolu!" });
        return;
      }

      // Kullanıcıyı odaya ekle
      socket.join(roomId);
      rooms[roomId].participants.push({ id: socket.id, username });
      console.log(`${username} odaya katıldı: ${roomId}`);

      // Çizen kişiyi belirle (eğer çizen yoksa ilk kullanıcı çizer)
      if (!rooms[roomId].drawer) {
        rooms[roomId].drawer = username;
      }

      // Odaya güncel bilgi gönder
      io.to(roomId).emit("gameInfo", {
        roomId,
        roomName: rooms[roomId].name,
        drawer: rooms[roomId].drawer,
        participants: rooms[roomId].participants.map((user) => user.username),
        messages: rooms[roomId].messages,
        answers: rooms[roomId].answers,
      });
    } else {
      socket.emit("error", { message: "Oda bulunamadı!" });
    }
  });

  // Çizim verilerini paylaş
  socket.on("draw", ({ roomId, x, y, prevX, prevY }) => {
    socket.to(roomId).emit("draw", { x, y, prevX, prevY });
  });

  // Cevap gönderildiğinde işle
  socket.on("submitAnswer", ({ roomId, username, answer }) => {
    if (rooms[roomId]) {
      rooms[roomId].answers.push({ username, answer });
      io.to(roomId).emit("newAnswer", { username, answer });
      console.log(`${username} şu cevabı gönderdi: ${answer}`);
    } else {
      socket.emit("error", { message: "Oda bulunamadı!" });
    }
  });

  // Mesaj gönderildiğinde işle
  socket.on("sendMessage", ({ roomId, username, message }) => {
    if (rooms[roomId]) {
      rooms[roomId].messages.push({ username, message });
      io.to(roomId).emit("chatMessage", { username, message });
      console.log(`${username} mesaj gönderdi: ${message}`);
    } else {
      socket.emit("error", { message: "Oda bulunamadı!" });
    }
  });

  // Kullanıcı bir odadan ayrıldığında
  socket.on("leaveRoom", ({ roomId, username }) => {
    if (rooms[roomId]) {
      // Kullanıcıyı odadan çıkar
      rooms[roomId].participants = rooms[roomId].participants.filter(
        (user) => user.username !== username
      );

      console.log(`${username} odadan ayrıldı: ${roomId}`);

      // Eğer çizen kişi ayrıldıysa, yeni bir çizen seç
      if (rooms[roomId].drawer === username) {
        rooms[roomId].drawer =
          rooms[roomId].participants.length > 0
            ? rooms[roomId].participants[0].username
            : null;
      }

      // Eğer oda boşaldıysa, odayı sil
      if (rooms[roomId].participants.length === 0) {
        delete rooms[roomId];
        console.log(`Oda silindi: ${roomId}`);
      }

      // Odaya güncel bilgi gönder
      io.to(roomId).emit("gameInfo", {
        roomId,
        drawer: rooms[roomId]?.drawer || null,
        participants:
          rooms[roomId]?.participants.map((user) => user.username) || [],
        messages: rooms[roomId]?.messages || [],
        answers: rooms[roomId]?.answers || [],
      });
    }
  });

  // Kullanıcı bağlantıyı kestiğinde
  socket.on("disconnect", () => {
    console.log("Bir kullanıcı bağlantıyı kesti:", socket.id);

    // Kullanıcının odadan çıkarılması
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const user = room.participants.find((u) => u.id === socket.id);
      if (user) {
        room.participants = room.participants.filter((u) => u.id !== socket.id);

        console.log(
          `${user.username} bağlantı kopması nedeniyle odadan çıktı: ${roomId}`
        );

        // Eğer çizen kişi çıktıysa yeni çizen seç
        if (room.drawer === user.username) {
          room.drawer =
            room.participants.length > 0 ? room.participants[0].username : null;
        }

        // Oda boşsa sil
        if (room.participants.length === 0) {
          delete rooms[roomId];
          console.log(`Oda silindi: ${roomId}`);
        }

        // Odaya güncel bilgiyi gönder
        io.to(roomId).emit("gameInfo", {
          roomId,
          drawer: room.drawer,
          participants: room.participants.map((u) => u.username),
          messages: room.messages,
          answers: room.answers,
        });
      }
    }
  });
});

// Express API (Opsiyonel)
app.get("/", (req, res) => {
  res.send("Socket.IO sunucusu çalışıyor!");
});

// Sunucuyu başlat
const PORT = 3001;
server.listen(PORT, "192.168.1.13", () => {
  console.log(`Backend sunucusu çalışıyor: http://localhost:${PORT}`);
});
