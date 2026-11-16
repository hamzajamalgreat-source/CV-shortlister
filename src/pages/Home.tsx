import React, { useState, useRef } from "react";

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
