import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Folder, FileText, X, CheckCircle2, Clock, Layers, ArrowRight, ChevronRight } from 'lucide-react';
import { FileExplorer } from './components/FileExplorer';

interface FileEntry {
  name: string;
  path: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}

interface HistoryEntry {
  name: string;
  count: number;
  totalSize: number;
  date: string;
}

const IGNORED_PATTERNS = ['__pycache__/', '.DS_Store', '.git/', 'node_modules/', '.next/', '.pyc'];

function filterFiles(files: FileList): FileEntry[] {
  return Array.from(files)
    .filter(f => {
      const p = f.webkitRelativePath || f.name;
      return !IGNORED_PATTERNS.some(pattern => p.includes(pattern));
    })
    .map(f => ({
      name: f.name,
      path: f.webkitRelativePath || f.name,
      size: f.size,
      type: f.type,
      webkitRelativePath: f.webkitRelativePath || f.name,
    }));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = folderInputRef.current;
    if (el) {
      (el as any).webkitdirectory = true;
      (el as any).directory = true;
    }
  }, []);

  const handleModeChoice = useCallback((mode: 'file' | 'folder') => {
    setIsModalOpen(false);
    setTimeout(() => {
      if (mode === 'file') fileInputRef.current?.click();
      else folderInputRef.current?.click();
    }, 80);
  }, []);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setIsDone(false);

    setTimeout(() => {
      const entries = filterFiles(files);
      if (entries.length === 0) {
        setIsProcessing(false);
        return;
      }

      setSelectedFiles(entries);
      setIsProcessing(false);
      setIsDone(true);

      const folderName = entries[0].webkitRelativePath.split('/')[0] || entries[0].name;
      const totalSize = entries.reduce((a, f) => a + f.size, 0);
      setHistory(h => [{
        name: folderName,
        count: entries.length,
        totalSize,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...h].slice(0, 6));
    }, 80);
  }, []);

  const totalSize = selectedFiles.reduce((a, f) => a + f.size, 0);

  return (
    <div className="min-h-screen text-slate-200 pb-24 selection:bg-violet-600 selection:text-white"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(109,40,217,0.12) 0%, #040608 70%)' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        data-bu-bypass="true"
        onChange={e => processFiles(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        data-bu-bypass="true"
        onChange={e => processFiles(e.target.files)}
      />

      <nav className="sticky top-0 z-40 border-b border-white/[0.04]"
        style={{ background: 'rgba(4,6,8,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Upload size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Bulk Uploader</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Upload size={14} /> Upload
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-16">

        <div className="mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/8 text-violet-400 text-xs font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Extension Active
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
            Upload anything,<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in bulk
            </span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Drop entire folder trees into any file input — preserving the full directory structure exactly as it is on disk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            <div
              onClick={() => setIsModalOpen(true)}
              className="group relative rounded-2xl border border-white/[0.06] cursor-pointer overflow-hidden transition-all hover:border-violet-500/30"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.06), transparent)' }} />
              <div className="relative p-12 flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl border border-white/[0.06] flex items-center justify-center transition-all group-hover:border-violet-500/30"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <Folder size={28} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border border-white/[0.06] flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Upload size={10} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white mb-1 group-hover:text-violet-100 transition-colors">Click to upload</p>
                  <p className="text-sm text-slate-600">Choose files or an entire folder with all its contents</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span>Files</span>
                  <ArrowRight size={12} />
                  <span>Folders</span>
                  <ArrowRight size={12} />
                  <span>Nested structures</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-white/[0.05] p-5 text-center"
                  style={{ background: 'rgba(255,255,255,0.015)' }}
                >
                  <p className="text-sm text-slate-400">Processing files...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedFiles.length > 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <FileExplorer files={selectedFiles} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-5">

            <div className="rounded-2xl border border-white/[0.05] p-5"
              style={{ background: 'rgba(255,255,255,0.015)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-4">Current Selection</p>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">{selectedFiles.length}</p>
                  <p className="text-xs text-slate-600 mt-0.5">files mapped</p>
                </div>
                <div className="h-px bg-white/[0.04]" />
                <div>
                  <p className="text-2xl font-bold text-white">{formatBytes(totalSize)}</p>
                  <p className="text-xs text-slate-600 mt-0.5">total size</p>
                </div>
                {isDone && selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-500/8 border border-emerald-500/15"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400 font-medium">Ready — paths preserved</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] p-5"
              style={{ background: 'rgba(255,255,255,0.015)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-slate-600" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">History</p>
              </div>
              <div className="space-y-1">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-700 py-4 text-center">No uploads yet</p>
                ) : history.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors px-2 -mx-2">
                    <div className="w-6 h-6 rounded-md bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <Layers size={11} className="text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-300 truncate">{item.name}/</p>
                      <p className="text-[10px] text-slate-600">{item.count} files · {formatBytes(item.totalSize)}</p>
                    </div>
                    <span className="text-[10px] text-slate-700 shrink-0">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] p-5"
              style={{ background: 'rgba(255,255,255,0.015)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-4">How it works</p>
              <div className="space-y-3">
                {[
                  { label: 'Click any upload button', desc: 'On this page or any website' },
                  { label: 'Choose a mode', desc: 'Files or full folder tree' },
                  { label: 'Paths preserved', desc: 'Relative paths intact on delivery' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/15 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-300">{step.label}</p>
                      <p className="text-[11px] text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' }}
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-[360px] rounded-3xl border border-white/[0.07] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
              style={{ background: '#0c0e14' }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-all"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <Upload size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Bulk Uploader</p>
                  <p className="text-[11px] text-slate-600">Choose upload mode</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleModeChoice('file')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg border border-white/[0.05] flex items-center justify-center text-slate-500 group-hover:text-slate-300 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <FileText size={17} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">Individual Files</p>
                    <p className="text-[11px] text-slate-600">Select one or more files</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                </button>

                <button
                  onClick={() => handleModeChoice('folder')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-violet-500/25 hover:border-violet-500/40 transition-all text-left group"
                  style={{ background: 'rgba(124,58,237,0.07)' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-violet-400"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Folder size={17} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-violet-100">Entire Folder</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide text-violet-400"
                        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.25)' }}>
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-violet-400/70">Recursive · preserves paths</p>
                  </div>
                  <ChevronRight size={14} className="text-violet-600 group-hover:text-violet-400 transition-colors" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-700 uppercase tracking-widest font-semibold">Extension ready</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
