import React, { FC } from "react";
import { CourseLayout } from "@/components/course/courseLayout";

interface StudyRoomLayoutProps {
  children: React.ReactNode;
}

export const StudyRoomLayout: FC<StudyRoomLayoutProps> = ({ children }) => {
  return (
    <CourseLayout>
      <div className="study-room-layout">
        {children}
        <p>
          Testing
        </p>
      </div>
    </CourseLayout>
  );
};