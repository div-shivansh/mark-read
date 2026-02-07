"use client";

import React, { createContext, useContext, useState } from "react";

interface FileContextType {
  file: File | null;
  setFile: (file: File) => void;
  highlights: any[];
  setHighlights: (highlights: any[]) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [highlights, setHighlights] = useState<any[]>([]);

  return (
    <FileContext.Provider value={{ file, setFile, highlights, setHighlights }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
}