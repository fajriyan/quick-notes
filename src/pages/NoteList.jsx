import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signInWithPopup, provider, signOut, db, auth } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function NoteList() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchNotes = async () => {
        const colRef = collection(db, "users", user.uid, "notes");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(data);
      };
      fetchNotes();
    } else {
      const saved = JSON.parse(localStorage.getItem("notes")) || [];
      setNotes(saved);
    }
  }, [user]);

  const addNote = async () => {
    const newNote = {
      title: `Note ${Math.floor(Math.random() * 2000)}`,
      items: [],
    };

    if (user) {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "notes"),
        newNote
      );
      setNotes([...notes, { ...newNote, id: docRef.id }]);
      navigate(`/note/${docRef.id}`);
    } else {
      const localNote = { id: Date.now(), ...newNote };
      const updated = [...notes, localNote];
      localStorage.setItem("notes", JSON.stringify(updated));
      setNotes(updated);
      navigate(`/note/${localNote.id}`);
    }
  };

  return (
    <div className="bg-amber-50/80 min-h-screen">
      <div className="px-5 max-w-4xl mx-auto ">
        <div className="flex h-[85px] justify-between items-center mb-3">
          <div className="flex gap-5 items-center  ">
            <img
              src="https://raw.githubusercontent.com/fajriyan/quick-notes/refs/heads/main/public/quicktime-nobg.png"
              className="w-16 object-contain"
              alt="quicknote"
              width="auto"
              height="auto"
              loading="eager"
              title="quicknote"
            />
            <div className="">
              <p className="font-semibold">
                {user?.displayName || "QuickNote"}
              </p>
              <p className="text-xs">
                {user?.email || "Tulis Catatan Kecil Anda"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              className={`pr-2  h-[40px]  border hover:shadow-md rounded-full cursor-pointer flex items-center font-semibold ${
                user ? "bg-rose-300 border-rose-300" : "border-cyan-700"
              }`}
              onClick={() =>
                user ? signOut(auth) : signInWithPopup(auth, provider)
              }
            >
              <img
                src={"https://img.icons8.com/color/512/google-logo.png"}
                className=" object-contain w-[40px] h-[25px]"
                alt="quictime"
                width="auto"
                height="auto"
                loading="lazy"
                title="quicknote"
              />
              {user ? "Logout" : "Login"}
            </button>
            <button
              onClick={addNote}
              className="sm:p-2 p-1 bg-cyan-800 hover:bg-cyan-900 hover:shadow-md text-white rounded-full cursor-pointer"
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
                  d="M5 12h14m-7 7V5"
                />
              </svg>
            </button>
          </div>
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

        <div className="text-center text-xs mt-2 text-amber-900/80">
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
    </div>
  );
}
