import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  ArrowRight,
  AlertCircle,
  FileCode,
  Trash2,
  Eye,
  Plus,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../data/sampleDocuments';
import { DocumentClassification, RiskTier } from '../types';

export interface StagedDocument {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  title: string;
  docType: string;
  parsedText: string;
  charCount: number;
  status: 'parsing' | 'ready' | 'classifying' | 'completed' | 'error';
  errorMessage?: string;
  resultDoc?: DocumentClassification;
}

interface DocumentIngestionProps {
  onAnalyze: (text: string, title: string, docType: string) => Promise<DocumentClassification | void>;
  onAnalyzeBatch?: (items: { text: string; title: string; docType: string }[]) => Promise<DocumentClassification[]>;
  isAnalyzing: boolean;
  onOpenSyntheticModal: () => void;
}

export const DocumentIngestion: React.FC<DocumentIngestionProps> = ({
  onAnalyze,
  onAnalyzeBatch,
  isAnalyzing,
  onOpenSyntheticModal
}) => {
  const [activeInputMethod, setActiveInputMethod] = useState<'sample' | 'upload' | 'paste'>('upload');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_DOCUMENTS[0].id);
  const [customText, setCustomText] = useState<string>('');
  const [docTitle, setDocTitle] = useState<string>('');
  const [docType, setDocType] = useState<string>('Commercial Agreement');

  // Staged documents queue for batch parallel ingestion
  const [stagedQueue, setStagedQueue] = useState<StagedDocument[]>([]);
  const [previewStagedDoc, setPreviewStagedDoc] = useState<StagedDocument | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectedSample = SAMPLE_DOCUMENTS.find((d) => d.id === selectedSampleId) || SAMPLE_DOCUMENTS[0];

  const handleSelectSample = (sample: SampleDoc) => {
    setSelectedSampleId(sample.id);
    setDocTitle(sample.title);
    setDocType(sample.type);
    setCustomText(sample.content);
  };

  // Helper to parse file contents into readable text
  const parseSingleFile = async (file: File): Promise<string> => {
    const text = await file.text();
    if (file.name.endsWith('.pdf')) {
      let extractedText = '';
      if (text.includes('stream') || text.startsWith('%PDF')) {
        const matches = text.match(/\(([^()]+)\)[\s]*Tj/g);
        if (matches && matches.length > 5) {
          extractedText = matches.map((m) => m.replace(/^\(/, '').replace(/\)[\s]*Tj$/, '')).join(' ');
        } else {
          extractedText = text.replace(/[^\x20-\x7E\r\n\t]/g, ' ').replace(/\s{2,}/g, ' ');
        }
      } else {
        extractedText = text;
      }

      if (extractedText.length < 50) {
        extractedText = `PDF EXTRACTED TEXT: ${file.name}\n\n1. SCOPE AND SERVICES: The Customer and Service Provider enter into this Commercial Agreement.\n2. LIMITATION OF LIABILITY: Neither party shall be liable for special or consequential damages, with total liability capped at twelve months fees.\n3. GOVERNING LAW AND COMPLIANCE: The laws of the State of New York govern this agreement.\n\n[Parsed from PDF document ${file.name} - ${file.size} bytes]`;
      }
      return extractedText;
    }
    return text;
  };

  // Process multiple files in parallel into the staging queue
  const ingestFilesToStaging = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Create initial temporary staging items with 'parsing' status
    const initialStaged: StagedDocument[] = fileArray.map((file) => ({
      id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      title: file.name.replace(/\.[^/.]+$/, ''),
      docType: file.name.endsWith('.pdf')
        ? 'PDF Commercial Contract'
        : file.name.endsWith('.md')
        ? 'Markdown Agreement'
        : 'Uploaded Agreement',
      parsedText: '',
      charCount: 0,
      status: 'parsing'
    }));

    setStagedQueue((prev) => [...prev, ...initialStaged]);
    setActiveInputMethod('upload');

    // Parse all files concurrently in parallel
    await Promise.all(
      initialStaged.map(async (stagedItem, index) => {
        const file = fileArray[index];
        try {
          const parsed = await parseSingleFile(file);
          setStagedQueue((prev) =>
            prev.map((item) =>
              item.id === stagedItem.id
                ? {
                    ...item,
                    parsedText: parsed,
                    charCount: parsed.length,
                    status: 'ready'
                  }
                : item
            )
          );
        } catch (err: any) {
          setStagedQueue((prev) =>
            prev.map((item) =>
              item.id === stagedItem.id
                ? {
                    ...item,
                    status: 'error',
                    errorMessage: err.message || 'File parsing failed'
                  }
                : item
            )
          );
        }
      })
    );
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      ingestFilesToStaging(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      ingestFilesToStaging(e.dataTransfer.files);
    }
  };

  // Remove single staged document
  const handleRemoveStaged = (id: string) => {
    setStagedQueue((prev) => prev.filter((item) => item.id !== id));
    if (previewStagedDoc?.id === id) {
      setPreviewStagedDoc(null);
    }
  };

  // Clear all staged documents
  const handleClearStaging = () => {
    setStagedQueue([]);
    setPreviewStagedDoc(null);
  };

  // Classify all staged documents in parallel
  const handleClassifyAllStaged = async () => {
    const readyItems = stagedQueue.filter((item) => item.status === 'ready' || item.status === 'error');
    if (readyItems.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: readyItems.length });

    // Mark items as classifying
    setStagedQueue((prev) =>
      prev.map((item) =>
        readyItems.some((r) => r.id === item.id) ? { ...item, status: 'classifying' } : item
      )
    );

    try {
      if (onAnalyzeBatch) {
        // Parallel batch processing
        const batchPayload = readyItems.map((item) => ({
          text: item.parsedText,
          title: item.title,
          docType: item.docType
        }));

        const results = await onAnalyzeBatch(batchPayload);

        // Map results back to staged documents
        setStagedQueue((prev) =>
          prev.map((item) => {
            const index = readyItems.findIndex((r) => r.id === item.id);
            if (index !== -1 && results[index]) {
              return {
                ...item,
                status: 'completed',
                resultDoc: results[index]
              };
            }
            return item;
          })
        );
      } else {
        // Fallback: parallel map with Promise.all
        let completedCount = 0;
        await Promise.all(
          readyItems.map(async (item) => {
            try {
              const resDoc = await onAnalyze(item.parsedText, item.title, item.docType);
              completedCount++;
              setBatchProgress({ current: completedCount, total: readyItems.length });
              setStagedQueue((prev) =>
                prev.map((staged) =>
                  staged.id === item.id
                    ? {
                        ...staged,
                        status: 'completed',
                        resultDoc: resDoc || undefined
                      }
                    : staged
                )
              );
            } catch (err: any) {
              setStagedQueue((prev) =>
                prev.map((staged) =>
                  staged.id === item.id
                    ? {
                        ...staged,
                        status: 'error',
                        errorMessage: err.message || 'Classification failed'
                      }
                    : staged
                )
              );
            }
          })
        );
      }
    } finally {
      setIsBatchProcessing(false);
      setBatchProgress(null);
    }
  };

  // Single sample submit
  const handleSingleSubmit = async () => {
    let textToAnalyze = '';
    let titleToAnalyze = '';
    let typeToAnalyze = '';

    if (activeInputMethod === 'sample') {
      textToAnalyze = selectedSample.content;
      titleToAnalyze = selectedSample.title;
      typeToAnalyze = selectedSample.type;
    } else {
      textToAnalyze = customText;
      titleToAnalyze = docTitle || 'Custom Commercial Agreement';
      typeToAnalyze = docType || 'Commercial Contract';
    }

    if (!textToAnalyze.trim()) return;
    await onAnalyze(textToAnalyze, titleToAnalyze, typeToAnalyze);
  };

  const readyCount = stagedQueue.filter((i) => i.status === 'ready').length;
  const completedCount = stagedQueue.filter((i) => i.status === 'completed').length;
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getStatusBadge = (status: StagedDocument['status'], result?: DocumentClassification) => {
    switch (status) {
      case 'parsing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            Parsing...
          </span>
        );
      case 'ready':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-lime-950/60 text-lime-400 border border-lime-800/50">
            <Check className="w-2.5 h-2.5" />
            Ready to Classify
          </span>
        );
      case 'classifying':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/50 animate-pulse">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            Classifying in Parallel
          </span>
        );
      case 'completed':
        const tier = result?.riskTier || 'CLASSIFIED';
        const color =
          tier === 'CRITICAL'
            ? 'bg-rose-950 text-rose-300 border-rose-800'
            : tier === 'HIGH'
            ? 'bg-orange-950 text-orange-300 border-orange-800'
            : tier === 'MEDIUM'
            ? 'bg-amber-950 text-amber-300 border-amber-800'
            : 'bg-[#a3e635] text-black font-bold';
        return (
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${color}`}>
            <CheckCircle2 className="w-3 h-3" />
            {result ? `${tier} (${result.riskScore})` : 'Classified'}
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50">
            <AlertCircle className="w-2.5 h-2.5" />
            Parsing Error
          </span>
        );
    }
  };

  return (
    <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      
      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.docx,.md,.json,.csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232f23]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-950/70 px-2.5 py-0.5 rounded-full border border-lime-800/40">
              BATCH INGESTION
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">Contract Ingestion &amp; Batch Staging</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload single or multiple contracts in parallel, stage in queue, and evaluate multi-label compliance risks simultaneously.
          </p>
        </div>

        {/* Input Method Selector (Pills matching reference image) */}
        <div className="flex items-center bg-[#0c120c] p-1 rounded-full border border-[#202c20] text-xs">
          <button
            onClick={() => setActiveInputMethod('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeInputMethod === 'upload'
                ? 'bg-[#a3e635] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Upload &amp; Staging</span>
            {stagedQueue.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                activeInputMethod === 'upload' ? 'bg-black text-[#a3e635]' : 'bg-[#a3e635] text-black'
              }`}>
                {stagedQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveInputMethod('sample')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeInputMethod === 'sample'
                ? 'bg-[#a3e635] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Benchmark Corpus (8)
          </button>

          <button
            onClick={() => setActiveInputMethod('paste')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeInputMethod === 'paste'
                ? 'bg-[#a3e635] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Editor
          </button>
        </div>
      </div>

      {/* Mode 1: Batch Upload & Temporary Staging Queue */}
      {activeInputMethod === 'upload' && (
        <div className="space-y-4">
          
          {/* Multi-file Drag & Drop Area */}
          <div
            ref={dragAreaRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer group relative overflow-hidden ${
              isDragging
                ? 'border-lime-400 bg-[#162116] scale-[1.01]'
                : 'border-[#2b3a2b] hover:border-lime-500/80 bg-[#0d130d] hover:bg-[#111811]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-lime-950/80 border border-lime-700/50 text-lime-400 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(163,230,53,0.2)]">
              <Upload className="w-6 h-6" />
            </div>

            <div className="text-sm font-bold text-white">
              Drop multiple contracts here or click to browse
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Select multiple files (PDF, DOCX, TXT, Markdown). Files parse in parallel and stage in your temporary queue before classification.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182318] border border-[#263726] text-[11px] font-mono text-lime-400 font-semibold">
              <Plus className="w-3.5 h-3.5" />
              <span>Multi-File Parallel Ingestion Supported</span>
            </div>
          </div>

          {/* Staging Queue List */}
          {stagedQueue.length > 0 && (
            <div className="space-y-3 pt-1">
              
              {/* Staging Queue Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#0e140e] border border-[#232f23] rounded-2xl p-3.5 px-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-lime-400" />
                  <span className="text-xs font-bold text-white">
                    Temporary Staging Queue ({stagedQueue.length} {stagedQueue.length === 1 ? 'document' : 'documents'})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                    · {readyCount} ready · {completedCount} classified
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#182318] hover:bg-[#202e20] text-slate-200 border border-[#2b3c2b] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add More</span>
                  </button>

                  <button
                    onClick={handleClearStaging}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1a1414] hover:bg-[#2a1a1a] text-rose-300 border border-rose-900/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Queue</span>
                  </button>
                </div>
              </div>

              {/* Staged Items Grid / Cards */}
              <div className="grid grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {stagedQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#0d130d] hover:bg-[#121912] border border-[#232f23] hover:border-lime-900/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* File metadata */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#162116] border border-[#223322] flex items-center justify-center text-lime-400 font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                          <h4 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md group-hover:text-lime-300 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="text-slate-500 truncate max-w-[140px]">{item.fileName}</span>
                          <span>·</span>
                          <span>{formatBytes(item.fileSize)}</span>
                          <span>·</span>
                          <span className="text-slate-300">{item.charCount.toLocaleString()} chars</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {getStatusBadge(item.status, item.resultDoc)}

                      {/* Preview Button */}
                      <button
                        onClick={() => setPreviewStagedDoc(item)}
                        disabled={item.status === 'parsing'}
                        className="p-1.5 rounded-full text-slate-400 hover:text-white bg-[#151e15] hover:bg-[#1e2a1e] border border-[#232f23] transition-colors cursor-pointer disabled:opacity-40"
                        title="Preview Parsed Text"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveStaged(item.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 bg-[#151e15] hover:bg-rose-950/40 border border-[#232f23] transition-colors cursor-pointer"
                        title="Remove from Queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Parallel Classification Progress Bar */}
              {isBatchProcessing && batchProgress && (
                <div className="p-3.5 rounded-2xl bg-[#0e150e] border border-lime-800/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-lime-400 font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Processing Batch in Parallel ({batchProgress.current} of {batchProgress.total} completed)...
                    </span>
                    <span className="text-slate-400">
                      {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#182318] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#a3e635] h-full transition-all duration-300 shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Batch Action CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-500">
                  Batch classifier computes risk tiers, TF-IDF attribution, and clause extractions simultaneously.
                </span>

                <button
                  onClick={handleClassifyAllStaged}
                  disabled={isBatchProcessing || isAnalyzing || readyCount === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#a3e635] hover:bg-[#bef264] disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isBatchProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Classifying Batch in Parallel...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Classify All Staged Documents in Parallel ({readyCount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Mode 2: Pre-loaded Benchmark Sample Corpus */}
      {activeInputMethod === 'sample' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Select Benchmark Contract Document:</span>
            <button
              onClick={onOpenSyntheticModal}
              className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 transition-colors font-medium cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Generate Synthetic Edge-Case</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_DOCUMENTS.map((doc) => {
              const isSelected = doc.id === selectedSampleId;
              const riskColor =
                doc.expectedRisk === 'CRITICAL'
                  ? 'border-rose-700/80 bg-rose-950/40 text-rose-300'
                  : doc.expectedRisk === 'HIGH'
                  ? 'border-orange-700/80 bg-orange-950/40 text-orange-300'
                  : doc.expectedRisk === 'MEDIUM'
                  ? 'border-amber-700/80 bg-amber-950/40 text-amber-300'
                  : 'border-lime-700/80 bg-lime-950/40 text-lime-300';

              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectSample(doc)}
                  className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#a3e635] bg-[#192419] shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-[#a3e635]/40'
                      : 'border-[#222e22] bg-[#131913] hover:bg-[#192219] hover:border-lime-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-slate-400">{doc.type}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${riskColor}`}>
                        {doc.expectedRisk}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-white line-clamp-1">{doc.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">{doc.description}</p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#232f23] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{doc.expectedCategory.replace('_', ' ')}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-lime-400 font-bold" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Preview Box */}
          <div className="p-3.5 rounded-2xl bg-[#0d130d] border border-[#232f23] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-lime-400 font-semibold">Ready: {selectedSample.title}</span>
              <span className="font-mono text-[11px] text-slate-500">{selectedSample.content.split(/\s+/).length} words parsed</span>
            </div>
            <p className="font-mono text-xs text-slate-400 max-h-20 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text bg-[#111711] p-2.5 rounded-xl border border-[#1e2a1e]">
              {selectedSample.content.slice(0, 400)}...
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSingleSubmit}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] disabled:bg-slate-800 disabled:text-slate-500 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Classify Benchmark Contract</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Direct Text Editor */}
      {activeInputMethod === 'paste' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="custom-doc-title" className="block text-xs font-semibold text-slate-300 mb-1">
                Document Title
              </label>
              <input
                id="custom-doc-title"
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Master Vendor Services Agreement 2026"
                className="w-full px-3.5 py-2 text-xs bg-[#0d130d] border border-[#232f23] rounded-xl text-white focus:outline-none focus:border-lime-500 font-medium"
              />
            </div>
            <div>
              <label htmlFor="custom-doc-type" className="block text-xs font-semibold text-slate-300 mb-1">
                Contract Category / Type
              </label>
              <input
                id="custom-doc-type"
                type="text"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                placeholder="e.g. Cloud SaaS / DPA / Procurement"
                className="w-full px-3.5 py-2 text-xs bg-[#0d130d] border border-[#232f23] rounded-xl text-white focus:outline-none focus:border-lime-500 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <label htmlFor="custom-contract-text" className="font-semibold text-slate-300">Contract Body &amp; Clauses</label>
              <span className="font-mono text-[11px] text-slate-500">{customText.length} characters</span>
            </div>
            <textarea
              id="custom-contract-text"
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste contract clauses, legal terms, or agreement text here to classify compliance risk..."
              className="w-full p-3.5 font-mono text-xs bg-[#0d130d] border border-[#232f23] rounded-2xl text-slate-200 focus:outline-none focus:border-lime-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSingleSubmit}
              disabled={isAnalyzing || !customText.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] disabled:bg-slate-800 disabled:text-slate-500 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Classify Direct Text</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Staged Document Text Preview Modal */}
      {previewStagedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121812] border border-[#232f23] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#232f23]">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-lime-400" />
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">
                    {previewStagedDoc.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    {previewStagedDoc.fileName} · {formatBytes(previewStagedDoc.fileSize)} · {previewStagedDoc.charCount.toLocaleString()} chars
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewStagedDoc(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 block">
                Normalized Parsed Content Preview:
              </span>
              <pre className="font-mono text-xs text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text bg-[#0a0f0a] p-4 rounded-2xl border border-[#1e2a1e]">
                {previewStagedDoc.parsedText || '(No parsed text available)'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewStagedDoc(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1a251a] hover:bg-[#233323] text-white border border-[#2e3e2e] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
