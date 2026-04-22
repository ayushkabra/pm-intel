import { useState, useEffect } from 'react';
import TagInput from '../components/TagInput';
import ResultCard from '../components/ResultCard';
import ExportActions from '../components/ExportActions';
import { simulateAIApi, parseResults } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function CompetitivePage() {
  const { user } = useAuth();
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [tags, setTags] = useState([]);
  const [timeframe, setTimeframe] = useState('Past Month');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('Ready when you are');
  const [results, setResults] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [digestEnabled, setDigestEnabled] = useState(false);
  
  const [tracking, setTracking] = useState({
    funding: true,
    product: true,
    reddit: true,
    youtube: false,
    jobs: false,
    pricing: false
  });

  // Load workspace on mount
  useEffect(() => {
    if (!user) return;
    
    const loadWorkspace = async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data && !error) {
        setCompany(data.company || '');
        setIndustry(data.industry || '');
        setTags(data.competitors || []);
        setDigestEnabled(data.digest_enabled || false);
        setWorkspaceId(data.id);
      }
    };
    
    loadWorkspace();
  }, [user]);

  const handleSaveWorkspace = async () => {
    if (!user) {
      setStatus('Please sign in to save your workspace');
      return;
    }
    if (!company) {
      setStatus('Company name is required to save');
      return;
    }

    setSaving(true);
    setStatus('Saving workspace...');

    const payload = {
      user_id: user.id,
      company,
      industry,
      competitors: tags,
      digest_enabled: digestEnabled,
      updated_at: new Date().toISOString()
    };

    try {
      let error;
      if (workspaceId) {
        // Update
        const res = await supabase.from('workspaces').update(payload).eq('id', workspaceId);
        error = res.error;
      } else {
        // Insert
        const res = await supabase.from('workspaces').insert([payload]).select();
        error = res.error;
        if (res.data && res.data.length > 0) setWorkspaceId(res.data[0].id);
      }
      
      if (error) throw error;
      setStatus('Workspace saved successfully!');
    } catch (err) {
      console.error(err);
      setStatus('Failed to save workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!company || tags.length === 0) {
      setStatus('Add your company and at least one competitor');
      return;
    }

    setLoading(true);
    setStatus('Running search...');
    setResults([]);

    const trackingParts = [
      tracking.funding && 'funding & recent news',
      tracking.product && 'product updates & launches',
      tracking.reddit && 'Reddit & social media sentiment',
      tracking.youtube && 'YouTube videos & reviews',
      tracking.jobs && 'job listings & hiring signals',
      tracking.pricing && 'pricing changes',
    ].filter(Boolean).join(', ');

    const prompt = `You are a senior competitive intelligence analyst for a product manager at ${company}${industry ? ' (' + industry + ')' : ''}.
Research these competitors: ${tags.join(', ')}. Focus on: ${trackingParts}.
Crucially: Limit your research to events that happened in the ${timeframe}. Filter out any noise that falls outside this timeframe.`;

    try {
      const responseText = await simulateAIApi(prompt);
      const parsed = parseResults(responseText);
      setResults(parsed);
      setStatus('Done — ' + new Date().toLocaleTimeString());

      // Save report if user is logged in
      if (user) {
        await supabase.from('reports').insert([{
          user_id: user.id,
          type: 'competitive',
          prompt: prompt,
          content: responseText
        }]);
      }
    } catch (error) {
      setStatus('Error');
      setResults([{ raw: 'Error', body: error.message, badge: 'badge-risk' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Competitive <em>study</em></h1>
          <p>Enter your company and competitors to get a real-time intelligence digest.</p>
        </div>
        {user && (
          <button 
            className="btn-secondary" 
            onClick={handleSaveWorkspace} 
            disabled={saving}
            style={{ padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}
          >
            {saving ? 'Saving...' : 'Save Workspace'}
          </button>
        )}
      </div>

      <div className="two-col">
        <div className="form-group">
          <label className="form-label">Your company</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Notion" />
        </div>
        <div className="form-group">
          <label className="form-label">Industry</label>
          <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Productivity SaaS" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Competitors — press Enter to add</label>
        <TagInput tags={tags} setTags={setTags} placeholder="Type competitor name and press Enter..." />
      </div>

      <div className="two-col">
        <div className="form-group">
          <label className="form-label">What to track</label>
          <div className="check-grid">
            {Object.entries(tracking).map(([key, value]) => (
              <label key={key} className="check-pill">
                <input type="checkbox" checked={value} onChange={() => setTracking({...tracking, [key]: !value})} />
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Timeframe</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="Past 24 hours">Past 24 hours</option>
            <option value="Past Week">Past Week</option>
            <option value="Past Month">Past Month</option>
            <option value="Past Quarter">Past Quarter</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label className="check-pill" style={{ display: 'inline-flex', padding: '6px 14px', background: digestEnabled ? 'var(--ink)' : 'var(--surface2)', color: digestEnabled ? 'var(--bg)' : 'var(--ink)', border: 'none', cursor: 'pointer', transition: '0.2s' }}>
          <input 
            type="checkbox" 
            checked={digestEnabled} 
            onChange={(e) => setDigestEnabled(e.target.checked)} 
            style={{ display: 'none' }}
          />
          <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', letterSpacing: '0', textTransform: 'none' }}>
            {digestEnabled ? '✓ Weekly digest enabled' : 'Enable weekly email digest via Resend'}
          </span>
        </label>
        <p style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '6px', fontFamily: 'Geist, sans-serif' }}>
          Automatically run this research every Monday morning and send it to your inbox.
        </p>
      </div>

      <div className="run-bar">
        <span className="run-status">{status}</span>
        <button className="btn-run" onClick={handleRun} disabled={loading}>
          {loading ? 'Running...' : 'Run analysis'} <span className="arrow">→</span>
        </button>
      </div>

      <div id="competitive-report" className="results">
        {loading && (
          <div className="loading-state">
            <div className="loading-dots"><span></span><span></span><span></span></div>
            <div className="loading-text">Searching the web for insights...</div>
          </div>
        )}
        
        {results.length > 0 && !loading && (
          <>
            <div className="results-header">
              <span className="results-label">Results</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <ExportActions 
                  elementId="competitive-report" 
                  rawMarkdown={results.map(r => `## ${r.raw}\n${r.body}`).join('\n\n')} 
                />
                <button className="results-clear" onClick={() => setResults([])}>Clear</button>
              </div>
            </div>
            {results.map((r, i) => <ResultCard key={i} {...r} />)}
          </>
        )}
      </div>
    </div>
  );
}
