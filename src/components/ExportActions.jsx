import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { supabase } from '../lib/supabase';
import { Download, Copy, Share2, Check } from 'lucide-react';

export default function ExportActions({ elementId, rawMarkdown, reportId = null, isPublicInitial = false }) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(isPublicInitial);
  const [sharing, setSharing] = useState(false);

  const handleDownloadPDF = () => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     `pm-intel-report-${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Temporarily hide export actions during PDF generation
    const exportDiv = document.getElementById('export-actions-' + elementId);
    if (exportDiv) exportDiv.style.display = 'none';
    
    html2pdf().set(opt).from(element).save().then(() => {
      if (exportDiv) exportDiv.style.display = 'flex';
    });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(rawMarkdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (!reportId) return;
    setSharing(true);
    try {
      const newStatus = !isPublic;
      const { error } = await supabase.from('reports').update({ is_public: newStatus }).eq('id', reportId);
      if (!error) {
        setIsPublic(newStatus);
        if (newStatus) {
          const shareUrl = `${window.location.origin}/shared/${reportId}`;
          navigator.clipboard.writeText(shareUrl);
          alert('Report is now public! Share link copied to clipboard:\n' + shareUrl);
        } else {
          alert('Report is now private.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div id={'export-actions-' + elementId} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button onClick={handleCopyMarkdown} className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface)', border: '0.5px solid var(--border2)' }}>
        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Markdown'}
      </button>
      <button onClick={handleDownloadPDF} className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface)', border: '0.5px solid var(--border2)' }}>
        <Download size={14} /> PDF
      </button>
      
      {reportId && (
        <button onClick={handleShare} disabled={sharing} className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isPublic ? 'var(--ink)' : 'var(--surface)', color: isPublic ? 'var(--bg)' : 'var(--ink)', border: '0.5px solid var(--border2)' }}>
          <Share2 size={14} /> {sharing ? '...' : isPublic ? 'Shared (Public)' : 'Share'}
        </button>
      )}
    </div>
  );
}
