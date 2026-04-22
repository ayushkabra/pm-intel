import { useState } from 'react';
import TagInput from '../components/TagInput';
import ResultCard from '../components/ResultCard';
import ExportActions from '../components/ExportActions';
import { simulateAIApi, parseResults } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function FeaturePage() {
  const { user } = useAuth();
  const [feature, setFeature] = useState('');
  const [context, setContext] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready when you are');
  const [results, setResults] = useState([]);
  
  const [focus, setFocus] = useState({
    ux: true,
    reception: true,
    tech: false,
    gaps: true,
    pricing: false
  });

  const handleRun = async () => {
    if (!feature || tags.length === 0) {
      setStatus('Add the feature and at least one company');
      return;
    }

    setLoading(true);
    setStatus('Running search...');
    setResults([]);

    const focusParts = [
      focus.ux && 'UX & design approach',
      focus.reception && 'user reception & reviews',
      focus.tech && 'technical implementation',
      focus.gaps && 'gaps & unmet needs',
      focus.pricing && 'pricing & access model',
    ].filter(Boolean).join(', ');

    const prompt = `You are a product analyst helping a PM benchmark a specific feature across companies.
Feature to study: "${feature}"
PM context: ${context || 'Building a new product'}
Companies to benchmark: ${tags.join(', ')}
Focus areas: ${focusParts}`;

    try {
      const responseText = await simulateAIApi(prompt);
      const parsed = parseResults(responseText);
      setResults(parsed);
      setStatus('Done — ' + new Date().toLocaleTimeString());

      // Save report if user is logged in
      if (user) {
        await supabase.from('reports').insert([{
          user_id: user.id,
          type: 'feature',
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
        <h1>Feature <em>study</em></h1>
        <p>Benchmark how a specific feature is implemented across products. Find the gaps.</p>
      </div>

      <div className="two-col">
        <div className="form-group">
          <label className="form-label">Feature to study</label>
          <input type="text" value={feature} onChange={e => setFeature(e.target.value)} placeholder="e.g. AI search, onboarding, pricing page" />
        </div>
        <div className="form-group">
          <label className="form-label">Your product context</label>
          <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. We're building a PM tool" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Companies to benchmark — press Enter to add</label>
        <TagInput tags={tags} setTags={setTags} placeholder="Type company name and press Enter..." />
      </div>

      <div className="form-group">
        <label className="form-label">What aspect to focus on</label>
        <div className="check-grid">
          {Object.entries(focus).map(([key, value]) => (
            <label key={key} className="check-pill">
              <input type="checkbox" checked={value} onChange={() => setFocus({...focus, [key]: !value})} />
              <span style={{ textTransform: 'capitalize' }}>
                {key === 'ux' ? 'UX & design' : key === 'reception' ? 'User reception' : key === 'tech' ? 'Technical approach' : key === 'gaps' ? 'Gaps & opportunities' : 'Pricing & access'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="run-bar">
        <span className="run-status">{status}</span>
        <button className="btn-run" onClick={handleRun} disabled={loading}>
          {loading ? 'Running...' : 'Study feature'} <span className="arrow">→</span>
        </button>
      </div>

      <div id="feature-report" className="results">
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
                  elementId="feature-report" 
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
