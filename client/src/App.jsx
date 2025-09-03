import { useState } from "react";
import axios from "axios";
import "./App.css";
import WorkflowCanvas from "./WorkflowCanvas";



function App() {
  const [status, setStatus] = useState("Not checked yet");
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);

  // ✅ check backend status
  const checkHealth = async () => {
    try {
      const res = await axios.get("http://localhost:5000/health");
      setStatus(res.data.status);
    } catch (err) {
      setStatus("error: " + err.message);
    }
  };

  // ✅ upload pdf
  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(res.data);
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  // ✅ ask a question
  const handleQuery = async () => {
    if (!question) return alert("Please type a question!");
    try {
      const res = await axios.post("http://localhost:5000/query", {
        question: question,
      });

      const chunks = res.data.matches[0] || [];
      const combinedAnswer = chunks.join(" "); // merge chunks

      setHistory((prev) => [...prev, { q: question, a: combinedAnswer }]);
      setQuestion(""); // clear input
    } catch (err) {
      alert("Query failed: " + err.message);
    }
  };

  return (
    // <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <div className="container">

      <h1>📚 Fullstack Workflow Builder</h1>

      {/* Backend Health */}
      <section style={{ marginBottom: "20px" }}>
        <h2>1. Backend Health</h2>
        <button onClick={checkHealth}>Check</button>
        <p>Status: {status}</p>
      </section>

      {/* Upload PDF */}
      <section style={{ marginBottom: "20px" }}>
        <h2>2. Upload PDF</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
        {uploadResult && (
          <div style={{ marginTop: "10px" }}>
            <p>✅ Uploaded: {uploadResult.filename}</p>
            <p>Chunks stored: {uploadResult.chunks_stored}</p>
            <p>Sample: {uploadResult.sample_chunk}</p>
          </div>
        )}
      </section>

      {/* Ask Question */}
      <section style={{ marginBottom: "20px" }}>
        <h2>3. Ask a Question</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleQuery}>Ask</button>
      </section>

      {/* History */}
      <section>
        <h3>Q&A History:</h3>
        {history.length === 0 ? (
          <p>No questions asked yet.</p>
        ) : (
          <ul>
            {history.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "15px" }}>
                <strong>Q:</strong> {item.q} <br />
                <strong>A:</strong> {item.a}
              </li>
            ))}
          </ul>
        )}
      </section>
      <h2>4. Workflow Builder</h2>
<WorkflowCanvas />

    </div>
  );
}

export default App;
