import { useState, useRef } from "react";

interface CandidateResult {
  name: string;
  email?: string;
  phone?: string;
  skills: number;
  experience: number;
  projects: number;
  education: number;
  final: number;
  eligibility: "Eligible" | "Needs_Review" | "Not_Eligible";
  evidence: Record<string, string>;
  failed_requirements?: string[];
}

interface Results {
  eligible: CandidateResult[];
  needs_review: CandidateResult[];
  not_eligible: CandidateResult[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Home() {
  const [dark, setDark] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mandatoryReqs, setMandatoryReqs] = useState<string[]>([]);
  const [mandatoryInput, setMandatoryInput] = useState("");
  const [weights, setWeights] = useState({ skills: 25, experience: 25, projects: 25, education: 25 });
  const [topN, setTopN] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const weightSum = weights.skills + weights.experience + weights.projects + weights.education;
  const isWeightValid = weightSum === 100;

  const bg = dark ? "#0a0e27" : "#f9fafb";
  const card = dark ? "#12152e" : "white";
  const border = dark ? "#2a2d4a" : "#e5e7eb";
  const text = dark ? "white" : "#1f2937";
  const text2 = dark ? "#9ca3af" : "#6b7280";

  const handleAddRequirement = () => {
    if (mandatoryInput.trim()) {
      setMandatoryReqs([...mandatoryReqs, mandatoryInput.trim()]);
      setMandatoryInput("");
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setMandatoryReqs(mandatoryReqs.filter((_, i) => i !== idx));
  };

  const handleDragEnter = () => {
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.name.endsWith(".pdf") || f.name.endsWith(".docx")
    );
    setFiles([...files, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.currentTarget.files || []);
    setFiles([...files, ...selected]);
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleShortlist = async () => {
    if (!isWeightValid) {
      setError("Weights must sum to 100%");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Job title is required");
      return;
    }

    if (files.length === 0) {
      setError("Please upload at least one CV");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("job_title", jobTitle);
      formData.append("job_description", jobDescription);
      formData.append("mandatory_requirements", JSON.stringify(mandatoryReqs));
      formData.append("weights", JSON.stringify(weights));
      formData.append("top_n", topN.toString());

      files.forEach((file) => {
        formData.append("cv_files", file);
      });

      const response = await fetch(`${API_URL}/api/shortlist`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to shortlist candidates");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const ScoreBadge = ({ score, max = 100 }: { score: number; max?: number }) => {
    const pct = (score / max) * 100;
    const bgColor =
      pct >= 80 ? "#10b98180" : pct >= 60 ? "#4f46e580" : pct >= 40 ? "#eab30880" : "#ef444480";
    const borderColor =
      pct >= 80 ? "#059669" : pct >= 60 ? "#4f46e5" : pct >= 40 ? "#eab308" : "#ef4444";

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          border: `1px solid ${borderColor}`,
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "bold",
          backgroundColor: bgColor,
          color: text,
        }}
      >
        {Math.round(score)}
        <span style={{ fontSize: "11px", opacity: 0.7 }}>/ {max}</span>
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bg, color: text, fontFamily: "system-ui" }}>
      {/* Header */}
      <header
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: card,
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>CV Screening</div>
        <button
          onClick={() => setDark(!dark)}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {!results ? (
          // Form State
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Job Title */}
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    backgroundColor: dark ? "#0a0e27" : "white",
                    color: text,
                    boxSizing: "border-box",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Job Description */}
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    backgroundColor: dark ? "#0a0e27" : "white",
                    color: text,
                    boxSizing: "border-box",
                    fontSize: "13px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Mandatory Requirements */}
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                  Mandatory Requirements
                </label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    value={mandatoryInput}
                    onChange={(e) => setMandatoryInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddRequirement();
                      }
                    }}
                    placeholder="e.g., 5+ years React experience"
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "4px",
                      border: `1px solid ${border}`,
                      backgroundColor: dark ? "#0a0e27" : "white",
                      color: text,
                      boxSizing: "border-box",
                      fontSize: "12px",
                    }}
                  />
                  <button
                    onClick={handleAddRequirement}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {mandatoryReqs.map((req, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        backgroundColor: "#ef444420",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {req}
                      <button
                        onClick={() => handleRemoveRequirement(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight Sliders */}
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", fontSize: "13px" }}>
                  Weights (Total: <span style={{ color: isWeightValid ? "#10b981" : "#ef4444" }}>{weightSum}%</span>)
                </label>
                {(["skills", "experience", "projects", "education"] as const).map((w) => (
                  <div key={w} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12px", textTransform: "capitalize" }}>{w}</label>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>{weights[w]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights[w]}
                      onChange={(e) =>
                        setWeights((prev) => ({ ...prev, [w]: parseInt(e.target.value) }))
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                ))}
              </div>

              {/* Top N */}
              <div style={{ backgroundColor: card, border: `1px solid ${border}`, padding: "16px", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                  Top N Candidates
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={topN}
                  onChange={(e) => setTopN(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    backgroundColor: dark ? "#0a0e27" : "white",
                    color: text,
                    boxSizing: "border-box",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* Shortlist Button */}
              <button
                onClick={handleShortlist}
                disabled={loading || !isWeightValid}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: isWeightValid ? "#7c3aed" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isWeightValid && !loading ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  fontSize: "14px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Processing..." : "Shortlist Candidates"}
              </button>
            </div>

            {/* Right Panel - File Upload */}
            <div>
              {/* Drop Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? "#7c3aed" : border}`,
                  padding: "40px",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: isDragging ? "rgba(124,58,237,0.1)" : "transparent",
                  transition: "all 0.3s",
                  marginBottom: "16px",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "16px" }}>Drag & drop CVs here</p>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#7c3aed",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Browse Files
                  </button>
                </label>
                <p style={{ fontSize: "12px", color: text2, marginTop: "12px" }}>
                  PDF or DOCX files only (max 5MB each)
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: "8px", padding: "16px" }}>
                  <p style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </p>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: idx < files.length - 1 ? `1px solid ${border}` : "none",
                        fontSize: "13px",
                      }}
                    >
                      <span>{file.name}</span>
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Results State
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>Results</h1>
                <p style={{ color: text2, fontSize: "13px" }}>
                  {results.eligible.length} eligible • {results.needs_review.length} needs review
                </p>
              </div>
              <button
                onClick={() => {
                  setResults(null);
                  setFiles([]);
                }}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                New Shortlist
              </button>
            </div>

            {/* Eligible Candidates */}
            {results.eligible.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    color: "#10b981",
                  }}
                >
                  ✓ Eligible ({results.eligible.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {results.eligible.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: card,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <div
                        onClick={() =>
                          setExpandedRow(expandedRow === `eligible-${idx}` ? null : `eligible-${idx}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <p style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                              #{idx + 1} {c.name}
                            </p>
                            <p style={{ fontSize: "12px", color: text2 }}>
                              {c.email} • {c.phone}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{Math.round(c.final)}</p>
                            <p style={{ fontSize: "11px", color: "#10b981", fontWeight: "bold" }}>
                              ELIGIBLE
                            </p>
                          </div>
                        </div>
                      </div>

                      {expandedRow === `eligible-${idx}` && (
                        <div
                          style={{
                            borderTop: `1px solid ${border}`,
                            paddingTop: "12px",
                            marginTop: "12px",
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "12px",
                            fontSize: "12px",
                          }}
                        >
                          <div>
                            <p style={{ color: text2, marginBottom: "4px" }}>Skills</p>
                            <ScoreBadge score={c.skills} />
                          </div>
                          <div>
                            <p style={{ color: text2, marginBottom: "4px" }}>Experience</p>
                            <ScoreBadge score={c.experience} />
                          </div>
                          <div>
                            <p style={{ color: text2, marginBottom: "4px" }}>Projects</p>
                            <ScoreBadge score={c.projects} />
                          </div>
                          <div>
                            <p style={{ color: text2, marginBottom: "4px" }}>Education</p>
                            <ScoreBadge score={c.education} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Needs Review */}
            {results.needs_review.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    color: "#f59e0b",
                  }}
                >
                  ⚠ Needs Review ({results.needs_review.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {results.needs_review.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: card,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <div
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === `review-${idx}` ? null : `review-${idx}`
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <p style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                              {c.name}
                            </p>
                            <p style={{ fontSize: "12px", color: text2 }}>
                              {c.email} • {c.phone}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{Math.round(c.final)}</p>
                            <p style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "bold" }}>
                              REVIEW
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Eligible */}
            {results.not_eligible.length > 0 && (
              <div>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    color: "#ef4444",
                  }}
                >
                  ✗ Not Eligible ({results.not_eligible.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {results.not_eligible.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: card,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                            {c.name}
                          </p>
                          <p style={{ fontSize: "12px", color: text2 }}>
                            {c.email} • {c.phone}
                          </p>
                          {c.failed_requirements && c.failed_requirements.length > 0 && (
                            <div style={{ marginTop: "8px", fontSize: "11px", color: "#ef4444" }}>
                              {c.failed_requirements.map((req, i) => (
                                <p key={i}>• {req}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "11px", color: "#ef4444", fontWeight: "bold" }}>
                            NOT ELIGIBLE
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
