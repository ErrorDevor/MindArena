// src/shared/context/UsersContext.tsx
"use client";
import { ReactNode, createContext, useContext, useState } from "react";

interface UsersContextType {
   dataArray: any[];
   addMyaData: (data: any) => void;
   debateId?: string;
   addDebatedId: (id: string | undefined) => void;
}

const DataContext = createContext<UsersContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
   const [data, setData] = useState<any[]>([]);
   const [debateId, setDebateId] = useState<string | undefined>(undefined);

   const addMyaData = (data: any) => setData((prev) => [...prev, data]);
   const addDebatedId = (id: string | undefined) => setDebateId(id);

   return (
      <DataContext.Provider value={{ dataArray: data, addMyaData, debateId, addDebatedId }}>
         {children}
      </DataContext.Provider>
   );
}

export function useData() {
   const ctx = useContext(DataContext);
   if (!ctx) throw new Error("useData must be used inside DataProvider");
   return ctx;
}
