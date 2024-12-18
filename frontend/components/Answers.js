"use client";

import React from "react";

export default function Answers({ answers }) {
  return (
    <div>
      <h2 className="text-lg font-bold">Cevaplar</h2>
      <div>
        {answers.map((answer, index) => (
          <div key={index}>
            <strong>{answer.username}: </strong>{answer.answer}
          </div>
        ))}
      </div>
    </div>
  );
}
