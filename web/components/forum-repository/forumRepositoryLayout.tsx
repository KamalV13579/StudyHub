import React from "react";

type ForumRepositoryLayoutProps = {
  children: React.ReactNode;
}

export function ForumRepositoryLayout({ children }: ForumRepositoryLayoutProps){
  return (
      <div className="resource-repository-layout">
        {children}
      </div>
  );
};