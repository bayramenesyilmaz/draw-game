"use client";

import React from "react";

export default function ParticipantsList({ participants }) {
  return (
    <div>
      <h2 className="text-lg font-bold">Katılımcılar</h2>
      <ul>
        {participants.map((participant) => (
          <li key={participant}>{participant}</li>
        ))}
      </ul>
    </div>
  );
}
