import React from "react";
import { User } from "@supabase/supabase-js";

interface ForumRepositoryLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function ForumRepositoryLayout({ children }: ForumRepositoryLayoutProps){
  return (
      <div className="resource-repository-layout">
        {children}
      </div>
  );
};