import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div>
      <h1>Upload File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" required onChange={(e) => setFile(e.target.files[0])} />
        <br />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <br />
        <button type="submit" disabled={!file || status === "Uploading..."}>Upload</button>
      </form>
      <p>{status}</p>
    </div>
  );
}
