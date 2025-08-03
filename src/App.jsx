import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NoteList from "./pages/NoteList";
import NoteDetail from "./pages/NoteDetail";
import { AuthProvider } from "./context/AuthContext";
import Whiteboard from "./pages/Whiteboard";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<NoteList />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/whiteboard" element={<Whiteboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
