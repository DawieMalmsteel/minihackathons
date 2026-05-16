'use client';

import { useState } from 'react';
import { Globe, Loader2, Search, ExternalLink, Building2 } from 'lucide-react';

type CompanyResult = {
  title: string;
  url: string;
  source: string;
  companyHint: string;
};

interface CompanySearchCardProps {
  role: string;
  recruiterRequirements?: string;
  strengths: string[];
  missingKeywords: string[];
}

export default function CompanySearchCard({
  role,
  recruiterRequirements,
  strengths,
  missingKeywords,
}: CompanySearchCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryUsed, setQueryUsed] = useState('');
  const [results, setResults] = useState<CompanyResult[]>([]);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/company-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          recruiterRequirements,
          strengths,
          missingKeywords,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Search failed.');
      }

      setQueryUsed(data.query || '');
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to search the web.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="panel p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-2xl text-[#f5efdb]">
          <Globe size={19} className="text-[var(--accent)]" />
          Company Match Search
        </h3>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-lime-200/50 bg-gradient-to-r from-[#2f420a] via-[#4e6913] to-[#6a891a] px-4 py-2.5 text-sm font-semibold tracking-[0.04em] text-[#f8ffd7] shadow-[0_8px_24px_rgba(213,255,95,0.22)] transition hover:-translate-y-0.5 hover:from-[#3c5410] hover:via-[#5b7818] hover:to-[#75971f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-200/70 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {isLoading ? 'Searching web...' : 'Search company for this CV'}
        </button>
      </div>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Use your CV strengths + target role to discover companies and career pages that look relevant.
      </p>

      {queryUsed && <p className="mt-3 text-xs text-[#a8a290]">Query: {queryUsed}</p>}

      {error && <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}

      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((item, index) => (
            <a
              key={`${item.url}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-[var(--line)] bg-[#12121a] p-4 transition hover:-translate-y-0.5 hover:border-lime-300/35"
            >
              <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                <Building2 size={13} />
                <span>{item.companyHint}</span>
                <span>·</span>
                <span>{item.source}</span>
              </div>

              <p className="flex items-start justify-between gap-3 text-sm font-semibold text-[#efe8d5]">
                <span>{item.title}</span>
                <ExternalLink size={14} className="mt-0.5 shrink-0 text-[#96907f]" />
              </p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
