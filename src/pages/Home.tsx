import { useState, FC } from "react";
import { ChevronDown } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  match_score: number;
  skills_score: number;
  experience_score: number;
  projects_score: number;
  education_score: number;
  extras_score: number;
  status: string;
  rank: number;
}

const Home: FC = () => {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("home");
  const [phase, setPhase] = useState("form");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Candidate[]>([]);
  const [weights, setWeights] = useState({ skills: 40, experience: 25, projects: 15, education: 10, extras: 10 });
  const [topN, setTopN] = useState(5);
  const [expanded, setExpanded] = useState<number | null>(null);

  const mockResults: Candidate[] = [
    { id: 1, rank: 1, name: "Aisha Khan", email: "aisha@test.com", phone: "+923001234", match_score: 95, skills_score: 40, experience_score: 25, projects_score: 15, education_score: 10, extras_score: 5, status: "Shortlisted" },
    { id: 2, rank: 2, name: "Bilal Ahmed", email: "bilal@test.com", phone: "+923006543", match_score: 82, skills_score: 36, experience_score: 20, projects_score: 14, education_score: 8, extras_score: 4, status: "Shortlisted" },
    { id: 3, rank: 3, name: "Hamza Raza", email: "hamza@test.com", phone: "+923007891", match_score: 68, skills_score: 28, experience_score: 15, projects_score: 10, education_score: 8, extras_score: 7, status: "Not Shortlisted" },
  ];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jdText || cvFiles.length === 0) {
      alert("Fill required fields");
      return;
    }
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      alert("Weights must total 100");
      return;
    }
    setResults(mockResults);
    setPhase("results");
  };

  const handleExport = () => {
    const csv = ["Rank,Name,Email,Match,Skills,Exp,Projects,Edu,Extras",
      ...results.map(r => `${r.rank},${r.name},${r.email},${r.match_score},${r.skills_score},${r.experience_score},${r.projects_score},${r.education_score},${r.extras_score}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${jobTitle}_results.csv`;
    a.click();
  };

  const dark = theme === "dark";
  const bg = dark ? "#0a0e27" : "#f9fafb";
  const card = dark ? "#12152e" : "white";
  const border = dark ? "#2a2d4a" : "#e5e7eb";
  const text = dark ? "white" : "#1f2937";
  const text2 = dark ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bg, color: text, fontFamily: "system-ui" }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>ResumeAI</div>
        <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>{theme === "dark" ? "☀️" : "🌙"}</button>
      </header>

      <nav style={{ borderBottom: `1px solid ${border}`, display: "flex", paddingLeft: "24px" }}>
        {(["home", "history", "blacklist"] as const).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ padding: "16px 24px", borderBottom: page === p ? "3px solid #7c3aed" : "none", background: "none", border: "none", cursor: "pointer", fontWeight: page === p ? "bold" : "600", color: page === p ? "#7c3aed" : text2, textTransform: "capitalize" }}>
            {p}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {page === "home" && phase === "form" && (
          <form onSubmit={handleEvaluate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "20px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Job Title</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Senior Frontend Developer" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box" }} />
              </div>

              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "20px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Job Description</label>
                <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste JD here..." rows={6} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box", resize: "vertical" }} />
              </div>

              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "20px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", fontSize: "14px" }}>Weights ({Object.values(weights).reduce((a, b) => a + b, 0)}/100)</label>
                {(Object.entries(weights) as [string, number][]).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ width: "80px", fontSize: "12px", textTransform: "capitalize" }}>{k}</label>
                    <input type="range" min="0" max="100" value={v} onChange={e => setWeights(p => ({ ...p, [k as keyof typeof weights]: parseInt(e.target.value) }))} style={{ flex: 1 }} />
                    <span style={{ width: "40px", textAlign: "right", fontSize: "12px" }}>{v}</span>
                  </div>
                ))}
              </div>

              <button type="submit" style={{ backgroundColor: "#7c3aed", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                Evaluate CVs
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ border: "2px dashed #7c3aed", padding: "40px", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ fontWeight: "bold", marginBottom: "16px" }}>Drag & drop CVs</p>
                <label style={{ cursor: "pointer" }}>
                  <input type="file" multiple onChange={e => setCvFiles(Array.from(e.target.files || []))} style={{ display: "none" }} />
                  <button type="button" style={{ backgroundColor: "#7c3aed", color: "white", padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}>
                    Browse Files
                  </button>
                </label>
              </div>

              {cvFiles.length > 0 && (
                <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>{cvFiles.length} files</p>
                  {cvFiles.map((f, i) => (
                    <div key={i} style={{ padding: "8px", fontSize: "12px", display: "flex", justifyContent: "space-between", borderBottom: i < cvFiles.length - 1 ? `1px solid ${border}` : "none" }}>
                      <span>{f.name}</span>
                      <button type="button" onClick={() => setCvFiles(p => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ fontSize: "12px", marginBottom: "12px" }}>Shortlist Count</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
                  <button type="button" onClick={() => setTopN(Math.max(1, topN - 1))} style={{ width: "40px", height: "40px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: card, cursor: "pointer", fontSize: "18px" }}>−</button>
                  <span style={{ fontSize: "28px", fontWeight: "bold", minWidth: "60px", textAlign: "center" }}>{topN}</span>
                  <button type="button" onClick={() => setTopN(topN + 1)} style={{ width: "40px", height: "40px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: card, cursor: "pointer", fontSize: "18px" }}>+</button>
                </div>
              </div>
            </div>
          </form>
        )}

        {page === "home" && phase === "results" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>Results — {jobTitle}</h1>
                <p style={{ color: text2, fontSize: "12px" }}>Avg Score: {Math.round(results.reduce((a, r) => a + r.match_score, 0) / results.length)}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleExport} style={{ backgroundColor: "#059669", color: "white", padding: "10px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600" }}>
                  Export CSV
                </button>
                <button onClick={() => setPhase("form")} style={{ backgroundColor: "#7c3aed", color: "white", padding: "10px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600" }}>
                  New Job
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {results.map(r => (
                <div key={r.id} style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: "8px", overflow: "hidden" }}>
                  <div onClick={() => setExpanded(expanded === r.id ? null : r.id)} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", cursor: "pointer" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: r.rank <= topN ? "#f59e0b" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px" }}>
                      {r.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "bold", marginBottom: "2px" }}>{r.name}</p>
                      <p style={{ fontSize: "12px", color: text2 }}>{r.email} • {r.phone}</p>
                    </div>
                    <p style={{ fontSize: "24px", fontWeight: "bold" }}>{r.match_score}</p>
                    <ChevronDown size={20} style={{ transform: expanded === r.id ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </div>

                  {expanded === r.id && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: "16px", backgroundColor: dark ? "#0a0e27" : "#f9fafb", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: text2 }}>Skills</p>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{r.skills_score}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: text2 }}>Experience</p>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{r.experience_score}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: text2 }}>Projects</p>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{r.projects_score}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: text2 }}>Education</p>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{r.education_score}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: text2 }}>Extras</p>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{r.extras_score}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {page === "history" && (
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>History</h1>
            <p style={{ color: text2 }}>No sessions yet</p>
          </div>
        )}

        {page === "blacklist" && (
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>Blacklist</h1>
            <p style={{ color: text2 }}>Empty</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
