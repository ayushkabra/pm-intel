import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ResultCard({ raw, body, badge }) {
  return (
    <div className="result-card">
      <div className="result-card-head">
        <div className="result-card-title">{raw}</div>
        <span className={`result-badge ${badge}`}>{badge.replace('badge-', '')}</span>
      </div>
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {body}
        </ReactMarkdown>
      </div>
    </div>
  );
}
