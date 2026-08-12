import { useMemo, useState, type FormEvent } from 'react';
import { chordDbStats } from './lib/chordDb';
import { generateProgressions, MusicInputError, type ProgressionResult } from './lib/musicEngine';
import { ProgressionCard } from './components/ProgressionCard';

const EXAMPLES = ['C', 'Am', 'G', 'D7', 'F#m7', 'Bbmaj7'];

function safeInitialResult(): ProgressionResult | null {
  try {
    return generateProgressions('C');
  } catch {
    return null;
  }
}

export default function App() {
  const [chord, setChord] = useState('C');
  const [result, setResult] = useState<ProgressionResult | null>(() => safeInitialResult());
  const [error, setError] = useState('');
  const stats = useMemo(() => chordDbStats(), []);

  function runGeneration(value: string) {
    try {
      const generated = generateProgressions(value);
      setResult(generated);
      setError('');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('chord', generated.input.normalized);
        window.history.replaceState({}, '', url);
      }
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof MusicInputError
          ? caught.message
          : 'No pude generar las progresiones. Intenta con otro acorde.'
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runGeneration(chord);
  }

  function chooseExample(example: string) {
    setChord(example);
    runGeneration(example);
  }

  return (
    <main>
      <section className="hero-shell">
        <nav className="topbar" aria-label="Principal">
          <a className="brand" href="/" aria-label="ChordPath inicio">
            <span className="brand-mark" aria-hidden="true">⌁</span>
            ChordPath
          </a>
          <span className="source-pill">Teoría local · sin IA por consulta</span>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow">DE UN ACORDE A UNA PROGRESIÓN TOCABLE</p>
          <h1>Escribe un acorde.<br />Obtén caminos que funcionan.</h1>
          <p className="hero-description">
            Cinco progresiones ordenadas por uso común, diagramas de guitarra, sensación musical y escalas para improvisar.
          </p>
        </div>

        <form className="generator" onSubmit={handleSubmit} noValidate>
          <label htmlFor="chord-input">Acorde inicial</label>
          <div className="generator-row">
            <input
              id="chord-input"
              value={chord}
              onChange={(event) => setChord(event.target.value)}
              placeholder="Ej. C, Am, G7, F#m7"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? 'input-error' : 'input-help'}
            />
            <button type="submit">Generar</button>
          </div>
          <div className="examples" id="input-help">
            <span>Prueba:</span>
            {EXAMPLES.map((example) => (
              <button type="button" key={example} onClick={() => chooseExample(example)}>
                {example}
              </button>
            ))}
          </div>
          {error && <p className="input-error" id="input-error" role="alert">{error}</p>}
        </form>

        <div className="source-note">
          <strong>{stats.numberOfVoicings.toLocaleString('es-CO')}</strong> digitaciones registradas en la fuente externa de acordes. La app no inventa una base propia de posiciones.
        </div>
      </section>

      {result && (
        <section className="results-shell" aria-live="polite">
          <div className="results-heading">
            <div>
              <p className="eyebrow">CONTEXTO ARMÓNICO</p>
              <h2>{result.input.normalized} → {result.tonalCenterLabel}</h2>
              <p>{result.explanation}</p>
            </div>
            <div className="result-count"><strong>5</strong><span>progresiones</span></div>
          </div>

          <div className="progressions-list">
            {result.recommendations.map((progression) => (
              <ProgressionCard key={progression.id} progression={progression} />
            ))}
          </div>
        </section>
      )}

      <footer>
        <span>ChordPath</span>
        <span>React + TypeScript · Tonal · chords-db</span>
      </footer>
    </main>
  );
}
