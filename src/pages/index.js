import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/files?caption=${filter}`)
      .then((res) => res.json())
      .then(data => {
          if (Array.isArray(data)) {
            setFiles(data);
          } else {
            setFiles([]); // Ensure files is always an array
          }
          setLoading(false);
      })
      .catch(() => {
        setFiles([]); // Also handle fetch errors
        setLoading(false);
      });
  }, [filter]);

  const getFileUrl = (fileId) => {
    // Note: This constructs the URL on the client-side and requires the bot token to be public.
    // This is generally not recommended for production.
    // A better approach would be an API route that redirects or proxies the download.
    const token = process.env.NEXT_PUBLIC_TG_BOT_TOKEN;
    if (!token) {
        console.error("Telegram bot token is not configured on the client-side.");
        return "#";
    }
    // This URL gets the file info, not the file itself. 
    // A second step is needed to get the file_path and construct the final download URL.
    // For simplicity in this example, we're linking to a conceptual download page.
    // A real implementation would need an API route like /api/download?file_id=...
    return `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
  }


  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>My Cloud Gallery</h1>
        <Link href="/upload" style={{ textDecoration: 'underline', color: 'blue' }}>
          Upload File
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search by caption"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
      />

      {loading && <p>Loading...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {files && files.map((f) => (
          <div key={f.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', width: '200px' }}>
            <p><b>Caption:</b> {f.caption || "No caption"}</p>
            <p><b>File ID:</b> {f.file_id}</p>
            {/* This will not directly download the file but shows the concept */}
            <a
              href={`/api/download?file_id=${f.file_id}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'underline', color: 'blue' }}
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
