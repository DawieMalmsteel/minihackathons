'use client';

import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Briefcase, ClipboardList } from 'lucide-react';

interface UploadFormProps {
  onSubmit: (file: File, role: string, level: string, recruiterRequirements: string) => void;
  isLoading: boolean;
}

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [recruiterRequirements, setRecruiterRequirements] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !role.trim()) return;
    onSubmit(file, role.trim(), level, recruiterRequirements.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="panel p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl text-[#f6f0dc]">Candidate Input</h2>
        <span className="rounded-full border border-[var(--line)] bg-[#1a1a21] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          step 01
        </span>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-5 cursor-pointer rounded-xl border p-6 transition ${
          file
            ? 'border-lime-300/35 bg-lime-300/5'
            : 'border-dashed border-[var(--line)] bg-[#111117] hover:-translate-y-0.5 hover:border-lime-200/35 hover:bg-[#15151b]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-lime-300/15 p-2.5 text-lime-300">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#f4eedc]">{file.name}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="rounded-md border border-red-400/30 p-1 text-red-300 transition hover:bg-red-500/20"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full border border-[var(--line)] bg-[#1a1a21] p-3 text-lime-200">
              <UploadCloud size={26} />
            </div>
            <p className="text-sm font-semibold text-[#f5efdd]">Drop your CV here or click to upload</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Text-based PDF only · Max 5MB</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            <Briefcase size={13} /> Target role
          </label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Backend Intern · Frontend Engineer · Data Analyst"
            required
            className="w-full rounded-xl border border-[var(--line)] bg-[#0f0f14] px-3.5 py-3 text-sm text-[#f3edd9] outline-none transition focus:border-lime-200/40"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Experience level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[#0f0f14] px-3.5 py-3 text-sm text-[#f3edd9] outline-none transition focus:border-lime-200/40"
          >
            <option value="" className="bg-[#121218]">Not specified</option>
            <option value="Intern" className="bg-[#121218]">Intern</option>
            <option value="Fresher" className="bg-[#121218]">Fresher</option>
            <option value="Junior" className="bg-[#121218]">Junior</option>
            <option value="Mid-Level" className="bg-[#121218]">Mid-level</option>
            <option value="Senior" className="bg-[#121218]">Senior</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            <ClipboardList size={13} /> Recruiter requirements (optional)
          </label>
          <textarea
            value={recruiterRequirements}
            onChange={(e) => setRecruiterRequirements(e.target.value)}
            rows={4}
            placeholder="Paste job requirements, must-have skills, project expectations..."
            className="w-full rounded-xl border border-[var(--line)] bg-[#0f0f14] px-3.5 py-3 text-sm text-[#f3edd9] outline-none transition placeholder:text-[#7b7669] focus:border-lime-200/40"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!file || !role.trim() || isLoading}
        className="mt-6 w-full rounded-xl border border-lime-200/45 bg-[var(--accent)] px-4 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#0f1108] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isLoading ? 'Analyzing dossier...' : 'Roast this CV'}
      </button>
    </form>
  );
}
