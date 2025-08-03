import React, { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function Whiteboard() {
  const excalRef = useRef(null);
  const LOCAL_STORAGE_KEY = "my-whiteboard";

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const SIX_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6;
        const savedAt = parsed.savedAt || 0;

        if (Date.now() - savedAt > SIX_MONTHS) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          console.log("Data localStorage sudah lebih dari 6 bulan, dihapus.");
        } else {
          setInitialData(parsed);
        }
      } catch (err) {
        console.error("Gagal parse localStorage:", err);
      }
    }
  }, []);

  const handleChange = async (elements, appState, files) => {
    const { collaborators, ...cleanAppState } = appState;

    const dataToSave = {
      elements: elements.filter((el) => !el.isDeleted),
      appState: cleanAppState,
      files,
      savedAt: Date.now(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  };

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw
        ref={excalRef}
        initialData={initialData}
        onChange={handleChange}
      />
    </div>
  );
}
