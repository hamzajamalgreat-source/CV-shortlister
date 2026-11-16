import { useState, FC } from "react";

interface Requirement { id: number; text: string; mandatory: boolean; }
interface JobSetup { title: string; description: string; requirements: Requirement[]; weights: { skills: number; experience: number; projects: number; education: number; }; minExperienceYears: number; topN: number; }
interface CandidateProfile { name: string; email: string; phone: string; skills: string[]; experienceYears: number; education: string; projects: string[]; }
interface ScoringResult { skills: number; experience: number; projects: number; education: number; final: number; }
interface Candidate { id: number; name: string; email: string; file: string; profile: CandidateProfile; scores: ScoringResult; eligibility: "Eligible" | "Needs Review" | "Not Eligible"; rank: number; evidence: { [key: string]: string }; }

const Home: FC = () => {
  const currentUser = "recruiter@example.com";
  const [page, setPage] = useState<"signin" | "dashboard" | "job-setup" | "upload" | "results">("dashboard");
  const [jobSetup, setJobSetup] = useState<JobSetup>({
    title: "", description: "", requirements: [], weights: { skills: 25, experience: 25, projects: 25, education: 25 }, minExperienceYears: 0, topN: 5
  });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({});
  const [newReq, setNewReq] = useState("");
  const [newReqMandatory, setNewReqMandatory] = useState(false);

  const weightSum = jobSetup.weights.skills + jobSetup.weights.experience + jobSetup.weights.projects + jobSetup.weights.education;

  const mockCandidates: Candidate[] = [
    {
      id: 1, name: "Aisha Khan", email: "aisha@test.com", file: "aisha_cv.pdf",
      profile: { name: "Aisha Khan", email: "aisha@test.com", phone: "+923001234567", skills: ["React", "TypeScript", "Node.js"], experienceYears: 5, education: "BS Computer Science", projects: ["E-commerce Platform", "Admin Dashboard"] },
      scores: { skills: 90, experience: 85, projects: 80, education: 100, final: 0 },
      eligibility: "Eligible", rank: 1, evidence: { skills: "React, TypeScript, Node.js listed in CV", experience: "5 years at Tech Company", education: "BS Computer Science from FAST", projects: "Led 2 major projects" }
    },
    {
      id: 2, name: "Bilal Ahmed", email: "bilal@test.com", file: "bilal_cv.pdf",
      profile: { name: "Bilal Ahmed", email: "bilal@test.com", phone: "+923006543210", skills: ["React", "JavaScript", "MongoDB"], experienceYears: 3, education: "BS Information Technology", projects: ["Mobile App", "Web Portal"] },
      scores: { skills: 70, experience: 60, projects: 65, education: 100, final: 0 },
      eligibility: "Eligible", rank: 2, evidence: { skills: "React and JavaScript skills confirmed", experience: "3 years developer experience", education: "BS Information Technology", projects: "2 projects completed" }
    },
    {
      id: 3, name: "Hamza Raza", email: "hamza@test.com", file: "hamza_cv.pdf",
      profile: { name: "Hamza Raza", email: "hamza@test.com", phone: "+923007891234", skills: ["Python", "Django"], experienceYears: 2, education: "Diploma in Software Development", projects: ["Data Analytics Project"] },
      scores: { skills: 30, experience: 40, projects: 20, education: 50, final: 0 },
      eligibility: "Needs Review", rank: 0, evidence: { skills: "No match for React/TypeScript requirements", experience: "Only 2 years, below 3-year requirement", education: "Diploma, not Bachelor's", projects: "Limited project experience" }
    },
  ];

  const calculateScores = (): void => {
    const scored = mockCandidates.map(c => {
      const final = Math.round((c.scores.skills * jobSetup.weights.skills + c.scores.experience * jobSetup.weights.experience + c.scores.projects * jobSetup.weights.projects + c.scores.education * jobSetup.weights.education) / 100);
      return { ...c, scores: { ...c.scores, final } };
    });

    const eligible = scored.filter(c => c.eligibility === "Eligible").sort((a, b) => b.scores.final - a.scores.final).map((c, i) => ({ ...c, rank: i + 1 }));
    const needsReview = scored.filter(c => c.eligibility === "Needs Review");
    const notEligible = scored.filter(c => c.eligibility === "Not Eligible");

    setCandidates([...eligible, ...needsReview, ...notEligible]);
    setPage("results");
  };

  const addRequirement = (): void => {
    if (newReq.trim()) {
      setJobSetup(prev => ({
        ...prev,
        requirements: [...prev.requirements, { id: Date.now(), text: newReq, mandatory: newReqMandatory }]
      }));
      setNewReq("");
      setNewReqMandatory(false);
    }
  };

  const removeRequirement = (id: number): void => {
    setJobSetup(prev => ({ ...prev, requirements: prev.requirements.filter(r => r.id !== id) }));
  };

  const handleSimulateUpload = async (): Promise<void> => {
    for (const cand of mockCandidates) {
      setUploadProgress(prev => ({ ...prev, [cand.file]: "Uploading..." }));
      await new Promise(r => setTimeout(r, 500));
      setUploadProgress(prev => ({ ...prev, [cand.file]: "Extracting..." }));
      await new Promise(r => setTimeout(r, 800));
      setUploadProgress(prev => ({ ...prev, [cand.file]: "Checking..." }));
      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(prev => ({ ...prev, [cand.file]: "Scored ✓" }));
    }
    setTimeout(() => calculateScores(), 1000);
  };

  const dark = true;
  const bg = dark ? "#0a0e27" : "#f9fafb";
  const card = dark ? "#12152e" : "white";
  const border = dark ? "#2a2d4a" : "#e5e7eb";
  const text = dark ? "white" : "#1f2937";
  const text2 = dark ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bg, color: text, fontFamily: "system-ui" }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: card }}>
        <div style={{ fontSize: "28px", fontWeight: "bold" }}>CV Screening System</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: text2 }}>Logged in: {currentUser}</span>
          <button onClick={() => setPage("dashboard")} style={{ padding: "8px 16px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Dashboard</button>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {page === "dashboard" && (
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "24px" }}>Jobs</h1>
            {jobSetup.title ? (
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>{jobSetup.title}</h2>
                    <p style={{ fontSize: "13px", color: text2 }}>{jobSetup.description.substring(0, 100)}...</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setPage("upload")} style={{ padding: "8px 16px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Process CVs</button>
                    <button onClick={() => setPage("job-setup")} style={{ padding: "8px 16px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Edit</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", fontSize: "13px" }}>
                  <div><p style={{ color: text2, marginBottom: "4px" }}>Requirements</p><p style={{ fontWeight: "bold", fontSize: "18px" }}>{jobSetup.requirements.length}</p></div>
                  <div><p style={{ color: text2, marginBottom: "4px" }}>Min Experience</p><p style={{ fontWeight: "bold", fontSize: "18px" }}>{jobSetup.minExperienceYears}y</p></div>
                  <div><p style={{ color: text2, marginBottom: "4px" }}>Top N</p><p style={{ fontWeight: "bold", fontSize: "18px" }}>{jobSetup.topN}</p></div>
                  <div><p style={{ color: text2, marginBottom: "4px" }}>Weights Sum</p><p style={{ fontWeight: "bold", fontSize: "18px", color: weightSum === 100 ? "#10b981" : "#ef4444" }}>{weightSum}/100</p></div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: "8px", padding: "40px", textAlign: "center" }}>
                <p style={{ color: text2, marginBottom: "16px" }}>No job created yet</p>
                <button onClick={() => setPage("job-setup")} style={{ padding: "10px 20px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Create New Job</button>
              </div>
            )}
          </div>
        )}

        {page === "job-setup" && (
          <div style={{ maxWidth: "800px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>Job Setup</h1>
            <div style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Job Title *</label>
                <input type="text" value={jobSetup.title} onChange={e => setJobSetup(prev => ({ ...prev, title: e.target.value }))} placeholder="Senior Frontend Developer" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box", fontSize: "14px" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Job Description *</label>
                <textarea value={jobSetup.description} onChange={e => setJobSetup(prev => ({ ...prev, description: e.target.value }))} placeholder="Enter job description..." rows={4} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box", fontSize: "14px", resize: "vertical" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Requirements</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input type="text" value={newReq} onChange={e => setNewReq(e.target.value)} placeholder="Enter requirement..." style={{ flex: 1, padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box", fontSize: "14px" }} />
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                    <input type="checkbox" checked={newReqMandatory} onChange={e => setNewReqMandatory(e.target.checked)} />
                    Mandatory
                  </label>
                  <button onClick={addRequirement} style={{ padding: "10px 16px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {jobSetup.requirements.map(req => (
                    <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", backgroundColor: dark ? "#0a0e27" : "#f3f4f6", borderRadius: "6px", fontSize: "13px" }}>
                      <span>{req.text} {req.mandatory ? "🔴" : ""}</span>
                      <button onClick={() => removeRequirement(req.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", fontSize: "14px" }}>Scoring Weights (Total: {weightSum}%)</label>
                {(["skills", "experience", "projects", "education"] as const).map(w => (
                  <div key={w} style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <label style={{ width: "100px", fontSize: "13px", textTransform: "capitalize" }}>{w}</label>
                    <input type="range" min="0" max="100" value={jobSetup.weights[w]} onChange={e => setJobSetup(prev => ({ ...prev, weights: { ...prev.weights, [w]: parseInt(e.target.value) } }))} style={{ flex: 1 }} />
                    <span style={{ width: "40px", textAlign: "right", fontWeight: "bold" }}>{jobSetup.weights[w]}%</span>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Minimum Experience (years)</label>
                <input type="number" min="0" value={jobSetup.minExperienceYears} onChange={e => setJobSetup(prev => ({ ...prev, minExperienceYears: parseInt(e.target.value) }))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box", fontSize: "14px" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>Top N Candidates</label>
                <input type="number" min="1" value={jobSetup.topN} onChange={e => setJobSetup(prev => ({ ...prev, topN: parseInt(e.target.value) }))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${border}`, backgroundColor: dark ? "#0a0e27" : "white", color: text, boxSizing: "border-box", fontSize: "14px" }} />
              </div>

              <button onClick={() => setPage("dashboard")} disabled={!jobSetup.title || !jobSetup.description || weightSum !== 100} style={{ padding: "12px", backgroundColor: weightSum === 100 ? "#059669" : "#9ca3af", color: "white", border: "none", borderRadius: "6px", cursor: weightSum === 100 ? "pointer" : "not-allowed", fontWeight: "bold", fontSize: "14px" }}>
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {page === "upload" && (
          <div style={{ maxWidth: "800px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>Upload & Process CVs</h1>
            <div style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: "8px", padding: "20px" }}>
              <p style={{ marginBottom: "16px", color: text2 }}>Job: <strong>{jobSetup.title}</strong></p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {mockCandidates.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: dark ? "#0a0e27" : "#f3f4f6", borderRadius: "6px", fontSize: "13px" }}>
                    <span>{c.file}</span>
                    <span style={{ color: uploadProgress[c.file] === "Scored ✓" ? "#10b981" : text2 }}>{uploadProgress[c.file] || "Ready"}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleSimulateUpload} style={{ width: "100%", padding: "12px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                Process All CVs
              </button>
            </div>
          </div>
        )}

        {page === "results" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>Results: {jobSetup.title}</h1>
                <p style={{ color: text2, fontSize: "13px" }}>{candidates.filter(c => c.eligibility === "Eligible").length} eligible • {candidates.filter(c => c.eligibility === "Needs Review").length} needs review</p>
              </div>
              <button onClick={() => setPage("dashboard")} style={{ padding: "10px 16px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Back</button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {candidates.map(c => (
                <div key={c.id} style={{ backgroundColor: card, border: `1px solid ${c.eligibility === "Eligible" ? "#059669" : c.eligibility === "Needs Review" ? "#f59e0b" : "#ef4444"}`, borderRadius: "8px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>{c.rank ? `#${c.rank}` : ""} {c.name}</p>
                      <p style={{ fontSize: "13px", color: text2 }}>{c.email} • {c.profile.phone}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>{c.scores.final}</p>
                      <p style={{ fontSize: "12px", color: c.eligibility === "Eligible" ? "#10b981" : c.eligibility === "Needs Review" ? "#f59e0b" : "#ef4444", fontWeight: "bold" }}>{c.eligibility}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px", fontSize: "12px" }}>
                    <div><p style={{ color: text2, marginBottom: "2px" }}>Skills</p><p style={{ fontWeight: "bold" }}>{c.scores.skills}</p></div>
                    <div><p style={{ color: text2, marginBottom: "2px" }}>Experience</p><p style={{ fontWeight: "bold" }}>{c.scores.experience}</p></div>
                    <div><p style={{ color: text2, marginBottom: "2px" }}>Projects</p><p style={{ fontWeight: "bold" }}>{c.scores.projects}</p></div>
                    <div><p style={{ color: text2, marginBottom: "2px" }}>Education</p><p style={{ fontWeight: "bold" }}>{c.scores.education}</p></div>
                  </div>

                  <div style={{ borderTop: `1px solid ${border}`, paddingTop: "12px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>Evidence</p>
                    {Object.entries(c.evidence).map(([key, val]) => (
                      <p key={key} style={{ fontSize: "12px", color: text2, marginBottom: "4px" }}><strong>{key}:</strong> {val}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;