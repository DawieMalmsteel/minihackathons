import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  role: z.string().min(1, 'Target role is required'),
  level: z.string().optional(),
  recruiterRequirements: z.string().optional(),
});

export const analysisResponseSchema = z.object({
  score: z.number(),
  rubric: z.object({
    clarity: z.number(),
    relevance: z.number(),
    impact: z.number(),
    ats: z.number(),
    language: z.number(),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  rewriteSuggestions: z.object({
    summary: z.string(),
    experience: z.string(),
    projects: z.string(),
    skills: z.string(),
  }),
  overallAdvice: z.string(),
});
