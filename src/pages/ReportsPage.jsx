import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ResultCard from '../components/ResultCard';
import ExportActions from '../components/ExportActions';
import { parseResults } from '../lib/api';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        console.error('Failed to fetch reports', err);
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (!user) {
    return (
      <div className="page active" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px', marginBottom: '1rem' }}>Saved Reports</h2>
        <p style={{ color: 'var(--ink2)', marginBottom: '2rem' }}>Please sign in to view your saved intelligence reports.</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="section-head">
        <h1>Saved <em>reports</em></h1>
        <p>Access your past competitive, market, and feature analysis reports.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-dots"><span></span><span></span><span></span></div>
          <div className="loading-text">Loading your reports...</div>
        </div>
      ) : error ? (
        <div className="error-card">{error}</div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <p>You haven't run any analysis yet. Head over to one of the tools to generate your first report!</p>
        </div>
      ) : (
        <div className="two-col" style={{ gridTemplateColumns: selectedReport ? '1fr 2fr' : '1fr' }}>
          {/* Sidebar list of reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="result-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: selectedReport?.id === report.id ? '1px solid var(--ink)' : '0.5px solid var(--border2)',
                  background: selectedReport?.id === report.id ? 'var(--surface2)' : 'var(--surface)',
                  padding: '1rem',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`result-badge badge-${report.type === 'competitive' ? 'news' : report.type === 'market' ? 'market' : 'feature'}`}>
                    {report.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {report.prompt.split('\n')[0]}...
                </div>
              </button>
            ))}
          </div>

          {/* Expanded view */}
          {selectedReport && (
            <div id="report-export-container" className="results" style={{ marginTop: 0, padding: '1rem', background: '#fff', borderRadius: 'var(--radius-lg)' }}>
              <div className="results-header">
                <span className="results-label">Report Details</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <ExportActions 
                    elementId="report-export-container" 
                    rawMarkdown={selectedReport.content} 
                    reportId={selectedReport.id} 
                    isPublicInitial={selectedReport.is_public || false}
                  />
                  <button className="results-clear" onClick={() => setSelectedReport(null)}>Close</button>
                </div>
              </div>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--ink2)' }}>
                <strong>Prompt context:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: '8px' }}>{selectedReport.prompt}</pre>
              </div>
              <div>
                {parseResults(selectedReport.content).map((r, i) => (
                  <ResultCard key={i} {...r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
