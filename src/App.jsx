import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CompetitivePage from './pages/CompetitivePage';
import MarketPage from './pages/MarketPage';
import FeaturePage from './pages/FeaturePage';
import AuthPage from './pages/AuthPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="competitive" element={<CompetitivePage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="feature" element={<FeaturePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>
    </Routes>
  );
}

export default App;
