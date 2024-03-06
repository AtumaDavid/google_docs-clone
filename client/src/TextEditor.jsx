import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  // Headers (H1 to H6)
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  // Font family
  [{ font: [] }],
  // Lists (ordered and bullet)
  [{ list: "ordered" }, { list: "bullet" }],
  // Basic text formatting (bold, italic, underline)
  ["bold", "italic", "underline"],
  // Text color and background color
  [{ color: [] }, { background: [] }],
  // Subscript and Superscript
  [{ script: "sub" }, { script: "super" }],
  // Text alignment (left, center, right, justify)
  [{ align: [] }],
  // Insert image, blockquote, and code block
  ["image", "blockquote", "code-block"],
  // Additional options:
  [{ link: true }, { video: true }],
  ["strike"],
  ["formula"],
  // ["table"],
  // ["indent", "outdent"],
  // ["undo", "redo"],
  // Remove formatting
  ["clean"],
];

export default function TextEditor() {
  //   const wrapperRef = useRef();
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  // console.log(documentId);

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    // q.enable(false);
    q.disable();
    q.setText("loading...");
    setQuill(q);
  }, []);

  return <div className="container" ref={wrapperRef}></div>;
}
