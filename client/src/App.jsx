import TextEditor from "./TextEditor";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  // Redirect,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" exact>
          <Redirect to={`/documents/${uuidV4()}`}></Redirect>
        </Route> */}
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
        {/* <Route path="/documents/:id">
          <TextEditor />
        </Route> */}
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
