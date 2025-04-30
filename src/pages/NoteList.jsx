import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NoteList() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(saved);
  }, []);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${Math.floor(Math.random() * 2000)}`,
      items: [],
    };
    const updated = [...notes, newNote];
    localStorage.setItem("notes", JSON.stringify(updated));
    setNotes(updated);
    navigate(`/note/${newNote.id}`);
  };

  return (
    <div className="bg-amber-50/80 min-h-screen">
      <div className="p-6 max-w-4xl mx-auto ">
        <div className="flex justify-between items-end mb-10">
          <div className="flex gap-5 items-center  ">
            <img
              src="/public/quicktime-nobg.png"
              className="w-10 object-contain"
              alt="quictime"
              width="auto"
              height="auto"
            />
            <div className="">
              <h1 className="text-2xl font-bold">Quicktime Notes</h1>
              <div className="text-xs">Tulis Catatan dengan Detail</div>
            </div>
          </div>

          <button
            onClick={addNote}
            className="px-4 py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-full cursor-pointer flex gap-2 items-center"
          >
            <svg
              class="w-6 h-6 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14m-7 7V5"
              />
            </svg>
            Tambah Note
          </button>
        </div>

        <div className="space-y-2 border p-3 border-amber-200  rounded-md h-[80vh] overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/note/${note.id}`)}
              className="cursor-pointer p-3 border border-amber-200 hover:border-amber-800/50 bg-amber-100/50 font-semibold line-clamp-1 rounded-md"
            >
              {note.title}
            </div>
          ))}
        </div>

        <div className="text-center text-xs mt-2 text-amber-900/80">quicktime notes by <a href="https://fajriyan.pages.dev/" target="_blank" className="underline">fajriyan</a></div>
      </div>
    </div>
  );
}
