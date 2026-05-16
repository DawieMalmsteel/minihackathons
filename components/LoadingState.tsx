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
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    isDone
                      ? 'border-lime-300/25 bg-lime-300/5 text-lime-200'
                      : isActive
                      ? 'border-[#3f4150] bg-[#1a1a22] text-[#f0ead7]'
                      : 'border-transparent text-[#8a8578]'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'animate-pulse' : ''} />
                  <span>{step.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
