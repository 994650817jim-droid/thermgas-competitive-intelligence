import { PageHead } from '../ui';
import Portfolio from '../Portfolio';

export default function PortfolioPage() {
  return (
    <div className="stack">
      <PageHead kicker="ThermGAS Portfolio" title="ThermGAS's own product line, as published on thermgas.com"
        lead="Eight product entries in four families. Specs are vendor claims as written on each page; gaps are shown as Not stated." />
      <Portfolio full />
    </div>
  );
}
