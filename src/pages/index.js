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

  return (
    <div style={{ fontFamily: 'sans-serif', padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: '2rem' }}>TeleGallery</h1>
        <Link href="/upload" style={{ textDecoration: 'none', color: '#fff', backgroundColor: '#007bff', padding: '10px 15px', borderRadius: '5px' }}>
          Upload File
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search by caption..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: "100%", padding: "12px", marginBottom: "20px", fontSize: '1rem', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      {loading && <p>Loading gallery...</p>}

      <div style={{ display: "grid", gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: "20px" }}>
        {files && files.map((f) => (
          <div key={f.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            {f.type === 'photo' && (
                <img 
                    src={`/api/download?file_id=${f.file_id}`} 
                    alt={f.caption || "Gallery image"} 
                    style={{ maxWidth: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
                />
            )}
            <div style={{ flexGrow: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{f.caption || "No caption"}</p>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '5px 0 10px 0' }}>Type: {f.type}</p>
            </div>
            <a
              href={`/api/download?file_id=${f.file_id}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', color: '#007bff', alignSelf: 'flex-start' }}
            >
              Download File
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
