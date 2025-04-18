import React from "react";

type ResourceRepositoryLayoutProps = {
  children: React.ReactNode;
}

export function ResourceRepositoryLayout({ children }: ResourceRepositoryLayoutProps){
  return (
      <div className="resource-repository-layout">
        {children}
      </div>
  );
};