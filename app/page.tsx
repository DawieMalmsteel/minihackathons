'use client';

import { useState } from 'react';
import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import UploadForm from '@/components/UploadForm';
import LoadingState from '@/components/LoadingState';
import ScoreCard from '@/components/ScoreCard';
import AnalysisSections from '@/components/AnalysisSections';
import CompanySearchCard from '@/components/CompanySearchCard';
import { AnalysisResponse } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [lastRole, setLastRole] = useState('');
  const [lastRecruiterRequirements, setLastRecruiterRequirements] = useState('');

  const handleAnalyze = async (
    file: File,
    role: string,
    level: string,
    recruiterRequirements: string
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    formData.append('level', level);
    formData.append('recruiterRequirements', recruiterRequirements);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze CV. Please try again.');
      }

      setResult(data);
      setLastRole(role);
      setLastRecruiterRequirements(recruiterRequirements);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <header className="mb-10 md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] kicker">
            <Sparkles size={14} />
            CV Intelligence Lab
          </div>

          <h1 className="max-w-4xl text-4xl leading-[0.95] text-[#f7f1dd] md:text-6xl xl:text-7xl">
            Roast your CV like a ruthless recruiter.
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Upload your CV dossier, add the target role, and include recruiter requirements for a sharper analysis.
            Get an ATS score, critical gaps, and rewritten sections you can paste directly.
          </p>

          <div className="mt-6 h-[3px] w-full max-w-2xl rounded-full accent-bar" />
        </header>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200 panel-soft">
            <AlertCircle className="mt-0.5 shrink-0 text-red-400" size={18} />
            <div className="flex-1">
              <h3 className="mb-1 text-base font-semibold">Analysis failed</h3>
              <p className="text-sm text-red-200/90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-md border border-red-400/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
            >
              Close
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-7 xl:grid-cols-12">
          <aside className={`xl:col-span-4 ${result || isLoading ? 'hidden xl:block' : ''}`}>
            <div className="xl:sticky xl:top-8">
              <UploadForm onSubmit={handleAnalyze} isLoading={isLoading} />

              {result && (
                <button
                  onClick={() => setResult(null)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[#15151b] py-3 text-sm font-semibold text-[#ece6d4] transition hover:-translate-y-0.5 hover:bg-[#1a1a21]"
                >
                  <RotateCcw size={15} />
                  Analyze another CV
                </button>
              )}
            </div>
          </aside>

          <div className="xl:col-span-8">
            {isLoading ? (
              <LoadingState />
            ) : result ? (
              <div className="space-y-6">
                <ScoreCard data={result} />
                <CompanySearchCard
                  role={lastRole}
                  recruiterRequirements={lastRecruiterRequirements}
                  strengths={result.strengths}
                  missingKeywords={result.missingKeywords}
                />
                <AnalysisSections data={result} />
              </div>
            ) : (
              <div className="panel flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
                <p className="kicker mb-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">Ready when you are</p>
                <h2 className="text-3xl text-[#f6f0dc] md:text-4xl">Your report will appear here.</h2>
                <p className="mt-3 max-w-lg text-sm text-[var(--muted)]">
                  We will score clarity, impact, ATS fit, and role relevance — then give rewritten sections to upgrade fast.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
