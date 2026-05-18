import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FileEntry {
  name: string;
  path: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}

interface Node {
  name: string;
  children: Record<string, Node>;
  files: FileEntry[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function buildTree(files: FileEntry[]): Node {
  const root: Node = { name: 'root', children: {}, files: [] };
  files.forEach(file => {
    const parts = file.webkitRelativePath.split('/');
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = { name: part, children: {}, files: [] };
      }
      current = current.children[part];
    }
    current.files.push(file);
  });
  return root;
}

export function FileExplorer({ files }: { files: FileEntry[] }) {
  if (files.length === 0) return null;

  const root = buildTree(files);
  const totalSize = files.reduce((a, f) => a + f.size, 0);

  return (
    <div className="rounded-2xl border border-white/[0.05] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.015)' }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Folder size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-slate-300">
            {files[0].webkitRelativePath.split('/')[0] || 'Files'}/
          </span>
          <span className="text-[10px] text-slate-600">{files.length} files</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">{formatBytes(totalSize)}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            Ready
          </span>
        </div>
      </div>

      {/* Tree */}
      <div className="p-3 max-h-80 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
        <TreeNode node={root} isRoot />
      </div>
    </div>
  );
}

function TreeNode({
  node,
  isRoot = false,
  depth = 0,
}: {
  node: Node;
  isRoot?: boolean;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (isRoot) {
    return (
      <div className="space-y-0.5">
        {Object.values(node.children).map(child => (
          <TreeNode key={child.name} node={child} depth={depth} />
        ))}
        {node.files.map(file => (
          <FileRow key={file.webkitRelativePath} file={file} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left hover:bg-white/[0.03] transition-colors group select-none"
        onClick={() => setIsOpen(v => !v)}
      >
        <span className="text-slate-700 group-hover:text-slate-500 transition-colors w-3.5 flex-shrink-0">
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <Folder size={13} className="text-violet-500/70 flex-shrink-0" />
        <span className="text-[12px] font-medium text-slate-400 group-hover:text-slate-300 transition-colors truncate">
          {node.name}/
        </span>
        <span className="ml-auto text-[10px] text-slate-700">
          {Object.keys(node.children).length + node.files.length}
        </span>
      </button>

      {isOpen && (
        <div className="pl-5 ml-1.5 border-l border-white/[0.04] space-y-0.5 mt-0.5">
          {Object.values(node.children).map(child => (
            <TreeNode key={child.name} node={child} depth={depth + 1} />
          ))}
          {node.files.map(file => (
            <FileRow key={file.webkitRelativePath} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file }: { file: FileEntry }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
      <File size={12} className="text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
      <span className="text-[12px] text-slate-500 group-hover:text-slate-400 transition-colors truncate">
        {file.name}
      </span>
      <span className="ml-auto text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {formatBytes(file.size)}
      </span>
    </div>
  );
}
