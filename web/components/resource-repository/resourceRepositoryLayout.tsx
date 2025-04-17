import React from "react";
import { User } from "@supabase/supabase-js";

interface ResourceRepositoryLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function ResourceRepositoryLayout({ children }: ResourceRepositoryLayoutProps){
  return (
      <div className="resource-repository-layout">
        {children}
      </div>
  );
};