import React from "react";

interface StudyRoomLayoutProps {
  children: React.ReactNode;
}

export function StudyRoomLayout({ children }: StudyRoomLayoutProps) {
  return (
    <div className="study-room-layout">
      {children}
      <p>Testing</p>
    </div>
  );
}
