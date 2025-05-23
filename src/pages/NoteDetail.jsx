import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

export default function NoteDetail() {
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);

      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "notes", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const noteData = { id: docSnap.id, ...docSnap.data() };
            setNote(noteData);
            setNewTitle(noteData.title);
          } else {
            setNote(null); // Note tidak ditemukan di Firebase
          }
        } catch (error) {
          console.error("Error fetching note:", error);
          setNote(null);
        }
      } else {
        const saved = JSON.parse(localStorage.getItem("notes")) || [];
        setNotes(saved);
        const found = saved.find((n) => String(n.id) === id);
        setNote(found || null);
        if (found) {
          setNewTitle(found.title);
        }
      }

      setIsLoading(false); // Selesai loading
    };

    fetchNote();
  }, [id, user]);

  const saveNotes = (updated) => {
    localStorage.setItem("notes", JSON.stringify(updated));
    setNotes(updated);
  };

  const updateNote = async (updatedNote) => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "notes", updatedNote.id);
      await updateDoc(docRef, updatedNote);
      setNote(updatedNote);
    } else {
      const updated = notes.map((n) =>
        n.id === updatedNote.id ? updatedNote : n
      );
      saveNotes(updated);
      setNote(updatedNote);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
    const newNote = {
      ...note,
      items: [...note.items, { id: Date.now(), text: newItem.trim(), time }],
      lastEdited: new Date().toISOString(), // Update last edited time
    };
    setNewItem("");
    updateNote(newNote);
  };

  const editItem = (itemId, newText) => {
    const updatedNote = {
      ...note,
      items: note.items.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      ),
      lastEdited: new Date().toISOString(), // Update last edited time
    };
    updateNote(updatedNote);
  };

  const deleteItem = (itemId) => {
    const updatedNote = {
      ...note,
      items: note.items.filter((item) => item.id !== itemId),
      lastEdited: new Date().toISOString(), // Update last edited time
    };
    updateNote(updatedNote);
  };

  const deleteNote = async () => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "notes", note.id);
      await deleteDoc(docRef);
      navigate("/");
    } else {
      const updated = notes.filter((n) => n.id !== note.id);
      saveNotes(updated);
      navigate("/");
    }
  };

  const handleTitleChange = () => {
    if (newTitle.trim() !== note.title) {
      const updatedNote = {
        ...note,
        title: newTitle,
        lastEdited: new Date().toISOString(),
      };
      updateNote(updatedNote);
    }
    setIsEditingTitle(false);
  };

  // Function to count words in the note
  const countWords = (items) => {
    return items?.reduce(
      (total, item) => total + item?.text.split(/\s+/).length,
      0
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-screen flex items-center justify-center">
          <img
            src="https://raw.githubusercontent.com/fajriyan/quick-notes/refs/heads/main/public/quicktime-nobg.png"
            className="w-32 object-contain animate-pulse"
            alt="quictime"
            width="auto"
            height="auto"
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-amber-50/80 min-h-screen">
        <div className="px-5 pb-10 max-w-4xl mx-auto pt-5 sm:pt-0">
          <div className="sm:flex h-[85px] justify-between items-center mb-3 sticky top-0 bg-amber-50/80 hidden">
            <button
              onClick={() => navigate("/")}
              className="p-1 sm:px-4 sm:py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-full cursor-pointer flex gap-1 items-center"
            >
              <svg
                className="w-6 h-6 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m15 19-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:block">Kembali</span>
            </button>
            <div className="">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border-b p-1 border-amber-200 w-[200px] sm:w-[450px]"
                  />
                  <button
                    onClick={handleTitleChange}
                    className="text-xs py-0.5 px-2 bg-amber-400 cursor-pointer hover:bg-amber-500/80 rounded-full"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="cursor-pointer"
                  >
                    <h2 className="text-[16px] font-semibold line-clamp-1 w-[200px] sm:w-[450px]">
                      {note?.title}
                    </h2>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={deleteNote}
              className="p-1 sm:px-4 sm:py-2 bg-red-800 hover:bg-red-900 text-white rounded-full cursor-pointer flex gap-2 items-center"
            >
              <svg
                className="w-6 h-6 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                />
              </svg>
              <span className="hidden sm:block">Hapus</span>
            </button>
          </div>

          {/* Display metadata */}
          <div className="text-sm text-gray-500 mb-4 border p-3 border-amber-200 rounded-md">
            <table className="w-full text-sm text-cyan-800">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 font-bold w-[80px]">Judul</td>
                  <td className="py-1">{note?.title}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-bold">Kata</td>
                  <td className="py-1">{countWords(note?.items)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-bold">Tanggal</td>
                  <td className="py-1">
                    {/* {new Date(note.lastEdited).toLocaleString("id-ID")} */}
                    <td className="py-1">
                      {note?.lastEdited
                        ? new Date(note.lastEdited).toLocaleString("id-ID", {
                            dateStyle: "full",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-bold">Item</td>
                  <td className="py-1">{note?.items.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 border p-3 border-amber-200 h-[67dvh] sm:h-[62.2vh] overflow-y-auto rounded-md">
            {note?.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-[60px]">
                  {item?.time}
                </span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => editItem(item?.id, e.target.textContent)}
                  className="text-cyan-800 w-[95%] text-[16px]"
                >
                  {item?.text}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-400 w-[3%]"
                >
                  <svg
                    className="w-5 h-5 text-red-700 hover:text-red-800 cursor-pointer"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-[60px]">
                {new Date().toLocaleTimeString("id-ID", { hour12: false })}
              </span>
              <textarea
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                className="w-full text-gray-500 placeholder:text-gray-300 resize-none outline-none text-[16px]"
                rows={1}
                placeholder="Ketik disini..."
              />
            </div>
          </div>

          <div className="text-center text-xs mt-2 text-amber-900/80 hidden sm:block">
            quicktime notes by{" "}
            <a
              href="https://fajriyan.pages.dev/"
              target="_blank"
              className="underline"
            >
              fajriyan
            </a>
          </div>
        </div>

        <div className="fixed bottom-0 w-full flex justify-center">
          <div className=" bg-amber-100/50 border border-amber-300 rounded-t-2xl w-full flex h-[70px] justify-between items-center sm:hidden px-5">
            <button
              onClick={() => navigate("/")}
              className="p-1 sm:px-4 sm:py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-full cursor-pointer flex gap-1 items-center"
            >
              <svg
                className="w-6 h-6 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m15 19-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:block">Kembali</span>
            </button>
            <div className="">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="border-b p-1 border-amber-200 w-[200px] sm:w-[450px]"
                  />
                  <button
                    onClick={handleTitleChange}
                    className="text-xs py-0.5 px-2 bg-amber-400 cursor-pointer hover:bg-amber-500/80 rounded-full"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="cursor-pointer"
                  >
                    <h2 className="text-[16px] font-semibold line-clamp-1 w-[200px] sm:w-[450px]">
                      {note?.title}
                    </h2>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={deleteNote}
              className="p-1 sm:px-4 sm:py-2 bg-red-800 hover:bg-red-900 text-white rounded-full cursor-pointer flex gap-2 items-center"
            >
              <svg
                className="w-6 h-6 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                />
              </svg>
              <span className="hidden sm:block">Hapus</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // if (!note) {
  //   return <div className="p-6">Note tidak ditemukan</div>;
  // }
}
