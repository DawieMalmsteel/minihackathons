import { useState } from 'react';
import { AnalysisResponse } from '@/lib/types';
import { ThumbsUp, ThumbsDown, KeyRound, Lightbulb, Copy, Check } from 'lucide-react';

interface AnalysisSectionsProps {
  data: AnalysisResponse;
}

export default function AnalysisSections({ data }: AnalysisSectionsProps) {
  const { strengths, weaknesses, missingKeywords, rewriteSuggestions, overallAdvice } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BulletCard
          title="Strengths"
          icon={<ThumbsUp size={16} className="text-lime-200" />}
          items={strengths}
          tone="positive"
        />

        <BulletCard
          title="Critical Gaps"
          icon={<ThumbsDown size={16} className="text-rose-200" />}
          items={weaknesses}
          tone="negative"
        />
      </div>

      <section className="panel p-5 md:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-2xl text-[#f5efdb]">
          <KeyRound size={18} className="text-[var(--accent)]" />
          Missing ATS Keywords
        </h3>

        {missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-lime-100"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No critical ATS keyword gaps detected. Solid alignment.</p>
        )}
      </section>

      <section className="panel p-5 md:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-2xl text-[#f5efdb]">
          <Lightbulb size={18} className="text-[var(--accent)]" />
          Rewrite Suggestions
        </h3>

        <div className="space-y-4">
          <RewriteBlock title="Professional Summary" content={rewriteSuggestions.summary} />
          <RewriteBlock title="Work Experience" content={rewriteSuggestions.experience} />
          <RewriteBlock title="Projects" content={rewriteSuggestions.projects} />
          <RewriteBlock title="Skills" content={rewriteSuggestions.skills} />
        </div>
      </section>

      <section className="panel-soft border-l-4 border-lime-300/50 p-5 md:p-6">
        <h3 className="text-xl text-[#f5efdb]">Final Advice</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#ddd5c0]">{overallAdvice}</p>
      </section>
    </div>
  );
}

function BulletCard({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: 'positive' | 'negative';
}) {
  const toneClass =
    tone === 'positive'
      ? 'border-lime-300/20 bg-lime-300/5'
      : 'border-rose-300/20 bg-rose-300/5';

  return (
    <section className={`panel p-5 md:p-6 ${toneClass}`}>
      <h3 className="mb-4 flex items-center gap-2 text-2xl text-[#f5efdb]">
        {icon}
        {title}
      </h3>

      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2 text-sm text-[#e2dbc7]">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RewriteBlock({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  if (!content || content.toLowerCase() === 'n/a' || content.toLowerCase() === 'not applicable') {
    return null;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[#101017]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <span className="text-sm font-semibold text-[#e9e1cc]">{title}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-[#1b1b24] hover:text-[#f4edd9]"
        >
          {copied ? <Check size={13} className="text-lime-200" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="px-4 py-3 text-sm leading-relaxed text-[#dcd4bf] whitespace-pre-wrap">{content}</div>
    </div>
  );
}
