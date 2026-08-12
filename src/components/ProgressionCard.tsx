import { useState } from 'react';
import type { ProgressionRecommendation } from '../lib/musicEngine';
import { ChordDiagram } from './ChordDiagram';
import { ScaleBlock } from './ScaleBlock';

export function ProgressionCard({ progression }: { progression: ProgressionRecommendation }) {
  const [copied, setCopied] = useState(false);
  const progressionText = progression.chords.join('  →  ');

  async function copyProgression() {
    try {
      await navigator.clipboard.writeText(progressionText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="progression-card">
      <header className="progression-header">
        <div>
          <div className="rank-line">
            <span className="rank">#{progression.rank}</span>
            <span className="popularity">{progression.popularity}</span>
          </div>
          <h3>{progressionText}</h3>
          <p className="roman-line">{progression.roman.join(' · ')}</p>
        </div>
        <button className="copy-button" type="button" onClick={copyProgression}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </header>

      <div className="genre-row">
        {progression.genres.map((genre) => <span key={genre}>{genre}</span>)}
      </div>

      <div className="diagram-grid">
        {progression.chords.map((chord, index) => (
          <ChordDiagram chordSymbol={chord} key={`${progression.id}-${chord}-${index}`} />
        ))}
      </div>

      <section className="emotion-block">
        <div className="section-kicker">Sensación</div>
        <p>{progression.emotion}</p>
      </section>

      <ScaleBlock scale={progression.scale} />
    </article>
  );
}
