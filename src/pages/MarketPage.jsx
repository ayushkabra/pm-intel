import { useState, useEffect } from 'react';
import ResultCard from '../components/ResultCard';
import ExportActions from '../components/ExportActions';
import { simulateAIApi, parseResults } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function MarketPage() {
  const { user } = useAuth();
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [question, setQuestion] = useState('');
  const [geo, setGeo] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready when you are');
  const [results, setResults] = useState([]);

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
      }
    };
    
    loadWorkspace();
  }, [user]);

  const handleRun = async () => {
    if (!company || !question) {
      setStatus('Fill in company name and your question');
      return;
    }

    setLoading(true);
    setStatus('Running search...');
    setResults([]);

    const prompt = `You are a market research analyst. A product manager needs market intelligence on ${company}${industry ? ' in the ' + industry + ' space' : ''}.
Geography focus: ${geo || 'Global'}.
Their question: ${question}`;

    try {
      const responseText = await simulateAIApi(prompt);
      const parsed = parseResults(responseText);
      setResults(parsed);
      setStatus('Done — ' + new Date().toLocaleTimeString());

      // Save report if user is logged in
      if (user) {
        await supabase.from('reports').insert([{
          user_id: user.id,
          type: 'market',
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
      <div className="section-head">
        <h1>Market <em>analysis</em></h1>
        <p>Get a structured market read on any company, product, or industry.</p>
      </div>

      <div className="two-col">
        <div className="form-group">
          <label className="form-label">Company or product</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Figma" />
        </div>
        <div className="form-group">
          <label className="form-label">Industry / category</label>
          <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Design tools, SaaS" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Your specific question</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. What is the TAM for design tools in Southeast Asia?"></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Geography focus (optional)</label>
        <input type="text" value={geo} onChange={e => setGeo(e.target.value)} placeholder="e.g. India, Southeast Asia, Global" />
      </div>

      <div className="run-bar">
        <span className="run-status">{status}</span>
        <button className="btn-run" onClick={handleRun} disabled={loading}>
          {loading ? 'Running...' : 'Analyze market'} <span className="arrow">→</span>
        </button>
      </div>

      <div id="market-report" className="results">
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
                  elementId="market-report" 
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
