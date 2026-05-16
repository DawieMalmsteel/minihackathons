import { useEffect, useState } from 'react';
import { FileText, Search, Cpu, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: FileText, text: 'Parsing CV file and extracting text layers' },
  { icon: Search, text: 'Checking structure, keyword density, ATS readability' },
  { icon: Cpu, text: 'Cross-matching with role and recruiter requirements' },
  { icon: CheckCircle2, text: 'Preparing rewrite suggestions and final verdict' },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel min-h-[420px] p-8 md:p-10">
      <div className="mx-auto max-w-xl">
        <p className="kicker mb-3 inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">analysis in progress</p>
        <h3 className="text-3xl text-[#f6f0dc] md:text-4xl">Running recruiter-grade evaluation</h3>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[#0f0f14] p-5">
          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[#1f2028]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isDone = index < currentStep;
              const isActive = index === currentStep;

              return (
                <div
                  key={step.text}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-all ${
                    isDone
                      ? 'border-lime-300/30 bg-lime-300/10 text-lime-100'
                      : isActive
                      ? 'border-[#5b5f74] bg-[#1c1d27] text-[#f6efdc] shadow-[0_0_0_1px_rgba(213,255,95,0.15)]'
                      : 'border-[#2e313f] bg-[#151720] text-[#9d9788]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'animate-pulse text-[var(--accent)]' : ''} />
                    <span>{step.text}</span>
                  </div>

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      isDone
                        ? 'border-lime-300/40 bg-lime-300/20 text-lime-100'
                        : isActive
                        ? 'border-[var(--accent)]/45 bg-[var(--accent)]/15 text-[#f4ffce]'
                        : 'border-[#3a3d4d] bg-[#222431] text-[#a59f8f]'
                    }`}
                  >
                    {isDone ? 'Done' : isActive ? 'Processing' : 'Queued'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
