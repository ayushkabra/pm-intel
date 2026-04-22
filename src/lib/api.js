function badgeFor(heading) {
  const h = heading.toLowerCase();
  if (h.includes('fund') || h.includes('news') || h.includes('announc')) return 'badge-news';
  if (h.includes('product') || h.includes('launch') || h.includes('feature') || h.includes('update')) return 'badge-product';
  if (h.includes('reddit') || h.includes('social') || h.includes('community') || h.includes('sentiment')) return 'badge-social';
  if (h.includes('market') || h.includes('segment') || h.includes('trend') || h.includes('tam') || h.includes('growth')) return 'badge-market';
  if (h.includes('gap') || h.includes('opportunit')) return 'badge-opportunity';
  if (h.includes('risk') || h.includes('threat') || h.includes('challenge') || h.includes('weakness')) return 'badge-risk';
  return 'badge-feature';
}

export function parseResults(text) {
  const blocks = text.split(/\n(?=#{1,3} |\*\*[A-Z][^*]+\*\*)/g).map(b => b.trim()).filter(Boolean);
  
  if (!blocks.length) {
    return [{ raw: 'Insights', body: text, badge: 'badge-feature' }];
  }

  return blocks.map(block => {
    const lines = block.split('\n');
    const raw = lines[0].replace(/^#+\s*|\*\*/g, '').trim();
    const body = lines.slice(1).join('\n').replace(/\*\*/g, '').trim();
    if (!raw) return null;
    return { raw, body: body || raw, badge: badgeFor(raw) };
  }).filter(Boolean);
}

export async function simulateAIApi(prompt) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock response based on prompt type to give realistic feeling
  if (prompt.includes('competitive intelligence')) {
    return `## Funding round — Competitor X raises $15M
They recently announced a Series A to expand their team.

## Product updates — New AI tools launched
Competitor Y just launched a suite of AI tools that automate workflows. 

## Reddit sentiment — Users frustrated with pricing
We noticed a spike in Reddit threads complaining about Competitor Z's new pricing model.`;
  }

  if (prompt.includes('market research analyst')) {
    return `## Market overview — TAM and growth
The market is currently valued at $5B and growing 15% YoY.

## Key customer segments — Enterprise vs SMB
Enterprise customers are driving 80% of revenue, while SMBs remain highly underserved.

## Opportunities — Mobile-first workflows
There is a massive gap in mobile-first solutions for frontline workers.`;
  }

  if (prompt.includes('benchmark a specific feature')) {
    return `## Feature Comparison Matrix
| Company | UX & Design | User Reception | Technical Approach | Gaps & Opportunities |
| :--- | :--- | :--- | :--- | :--- |
| **Competitor A** | Seamless integration | Highly positive | Proprietary wrapper | Lacks advanced filtering |
| **Competitor B** | Clunky, hidden menus | Mixed, often ignored | Off-the-shelf API | Opportunity for better onboarding |
| **Competitor C** | Clean but overwhelming | Positive | Custom edge deployment | Steep learning curve |

## Overall Synthesis
Competitor A leads in user experience by keeping the feature invisible until needed. The biggest gap in the market currently is advanced filtering combined with an intuitive onboarding flow.`;
  }

  return '## Insights gathered\nFound some interesting trends based on your query.';
}
