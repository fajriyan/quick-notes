import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NoteList from "./pages/NoteList";
import NoteDetail from "./pages/NoteDetail";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<NoteList />} />
          <Route path="/note/:id" element={<NoteDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
