import { useState } from "react";
import Link from "next/link";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
        setStatus("Please select a file to upload.");
        return;
    }
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
        setStatus("Uploaded successfully!");
        setFile(null);
        setCaption("");
        e.target.reset();
    } else {
        setStatus("Error: " + data.error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Link href="/" style={{ textDecoration: 'underline', color: 'blue', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Back to Gallery
      </Link>
      <h1>Upload File</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
        <input type="file" required onChange={(e) => setFile(e.target.files[0])} />
        <br />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ padding: "8px" }}
        />
        <br />
        <button type="submit" disabled={!file || status === "Uploading..."} style={{ padding: "10px", cursor: "pointer" }}>Upload</button>
      </form>
      <p>{status}</p>
    </div>
  );
}
