import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/files?caption=${filter}`)
      .then((res) => res.json())
      .then(data => {
          if (Array.isArray(data)) {
            setFiles(data);
            setError(null);
          } else {
            setFiles([]); // Ensure files is always an array
            setError(data.error || "Failed to load files.");
          }
          setLoading(false);
      })
      .catch((err) => {
        setFiles([]); // Also handle fetch errors
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      });
  }, [filter]);

  const handleEditClick = (file) => {
    setEditingId(file.id);
    setEditingCaption(file.caption || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCaption("");
  };

  const handleUpdateCaption = async (fileId) => {
    if (!fileId) return;

    const res = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, caption: editingCaption }),
    });
    
    const result = await res.json();
    
    if (result.success && result.file) {
        setFiles(files.map(f => (f.id === fileId ? result.file : f)));
        handleCancelEdit(); // Exit editing mode
    } else {
        alert("Failed to update caption: " + (result.error || "Unknown error"));
    }
  };


  return (
    <div style={{ fontFamily: 'sans-serif', padding: "20px", maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>TeleGallery</h1>
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
      {error && <p style={{color: 'red'}}>Error: {error}</p>}

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
                {editingId === f.id ? (
                    <input
                        type="text"
                        value={editingCaption}
                        onChange={(e) => setEditingCaption(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
                    />
                ) : (
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{f.caption || "No caption"}</p>
                )}
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '5px 0 10px 0' }}>Type: {f.type}</p>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
                 <a
                  href={`/api/download?file_id=${f.file_id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', color: '#007bff', alignSelf: 'flex-start' }}
                >
                  Download
                </a>
                {editingId === f.id ? (
                    <div>
                        <button onClick={() => handleUpdateCaption(f.id)} style={{marginRight: '5px'}}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => handleEditClick(f)}>Edit</button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}