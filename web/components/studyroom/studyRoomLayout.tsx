import React from "react";
import { User } from "@supabase/supabase-js";

interface StudyRoomLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function StudyRoomLayout({ children }: StudyRoomLayoutProps){
  return (
      <div className="study-room-layout">
        {children}
      </div>
  );
};