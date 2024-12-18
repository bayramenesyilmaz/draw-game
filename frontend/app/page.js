"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/rooms?username=${username}`);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Giriş Yap</h1>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          className="border p-2 rounded w-full mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
        >
          Devam Et
        </button>
      </form>
    </div>
  );
}
