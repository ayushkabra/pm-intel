import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page active">
      <div className="home-hero">
        <h1>Your intelligence<br />layer, <em>simplified.</em></h1>
        <p>One tool for competitive research, market analysis, and feature benchmarking. Built for PMs who want signal, not noise.</p>
      </div>
      <div className="home-cards">
        <button className="home-card" onClick={() => navigate('/competitive')}>
          <div className="home-card-num">01</div>
          <h3>Competitive study</h3>
          <p>Track funding, product moves, social buzz, and job signals for any competitor.</p>
          <div className="home-card-arrow">→</div>
        </button>
        <button className="home-card" onClick={() => navigate('/market')}>
          <div className="home-card-num">02</div>
          <h3>Market analysis</h3>
          <p>Understand market size, segments, trends and opportunities for any space.</p>
          <div className="home-card-arrow">→</div>
        </button>
        <button className="home-card" onClick={() => navigate('/feature')}>
          <div className="home-card-num">03</div>
          <h3>Feature study</h3>
          <p>Benchmark how a specific feature is built across products. Find the gaps.</p>
          <div className="home-card-arrow">→</div>
        </button>
      </div>
    </div>
  );
}
