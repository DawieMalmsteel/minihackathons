export interface Rubric {
  clarity: number;
  relevance: number;
  impact: number;
  ats: number;
  language: number;
}

export interface RewriteSuggestions {
  summary: string;
  experience: string;
  projects: string;
  skills: string;
}

export interface AnalysisResponse {
  score: number;
  rubric: Rubric;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  rewriteSuggestions: RewriteSuggestions;
  overallAdvice: string;
}
