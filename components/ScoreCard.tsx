import { AnalysisResponse } from '@/lib/types';
import { BadgeCheck, CircleAlert, Radar } from 'lucide-react';

interface ScoreCardProps {
  data: AnalysisResponse;
}

export default function ScoreCard({ data }: ScoreCardProps) {
  const { score, rubric } = data;

  const verdict = score >= 80 ? 'ATS Ready' : score >= 60 ? 'Competitive but risky' : 'Needs heavy rewrite';
  const verdictClass =
    score >= 80
      ? 'text-lime-200 border-lime-300/30 bg-lime-300/10'
      : score >= 60
      ? 'text-amber-200 border-amber-300/30 bg-amber-300/10'
      : 'text-rose-200 border-rose-300/30 bg-rose-300/10';

  return (
    <section className="panel p-6 md:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="panel-soft p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Overall score</p>
          <p className="mt-2 text-7xl leading-none text-[#f5efdb]">{score}</p>
          <p className="mt-1 text-sm text-[#9a9485]">/100</p>

          <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${verdictClass}`}>
            {score >= 80 ? <BadgeCheck size={13} /> : <CircleAlert size={13} />}
            {verdict}
          </div>

          <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full border border-[#323541] bg-[#20222b]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(0, Math.min(score, 100))}%`,
                background: 'linear-gradient(90deg, #b9de4a 0%, #d5ff5f 55%, #f0ffb6 100%)',
                boxShadow: '0 0 16px rgba(213,255,95,0.35)',
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-2xl text-[#f5efdb]">
            <Radar size={20} className="text-[var(--accent)]" />
            Rubric Breakdown
          </h3>
          <div className="space-y-3">
            <RubricRow label="Clarity & Structure" score={rubric.clarity} max={20} />
            <RubricRow label="Relevance to Role" score={rubric.relevance} max={25} />
            <RubricRow label="Quantified Impact" score={rubric.impact} max={20} />
            <RubricRow label="ATS Friendliness" score={rubric.ats} max={20} />
            <RubricRow label="Language Quality" score={rubric.language} max={15} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RubricRow({ label, score, max }: { label: string; score: number; max: number }) {
  const percentage = Math.max(0, Math.min((score / max) * 100, 100));

  return (
    <div className="panel-soft px-3.5 py-3">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-[#e9e2cf]">{label}</span>
        <span className="font-semibold text-[#f8f1dd]">
          {score}
          <span className="text-[#8f897b]"> / {max}</span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[#343747] bg-[#1f2129]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #9fc53a 0%, #d5ff5f 60%, #f2ffc2 100%)',
            boxShadow: '0 0 14px rgba(213,255,95,0.3)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.08) 19px, rgba(255,255,255,0.08) 20px)',
          }}
        />
      </div>
    </div>
  );
}
