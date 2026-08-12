import { getDiagramLookup, type ChordPosition } from '../lib/chordDb';

const STRING_X = [18, 40, 62, 84, 106, 128];
const TOP = 30;
const FRET_GAP = 27;
const SHOWN_FRETS = 4;

function relativeFret(fret: number, baseFret: number): number {
  if (fret <= 0) return fret;
  if (baseFret > 1 && fret >= baseFret) return fret - baseFret + 1;
  return fret;
}

function markerY(fret: number, baseFret: number): number {
  const relative = Math.max(1, Math.min(SHOWN_FRETS, relativeFret(fret, baseFret)));
  return TOP + (relative - 0.5) * FRET_GAP;
}

function Barre({ fret, position }: { fret: number; position: ChordPosition }) {
  const strings = position.frets
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => value === fret)
    .map(({ index }) => index);

  if (strings.length < 2) return null;
  const start = STRING_X[Math.min(...strings)];
  const end = STRING_X[Math.max(...strings)];
  const y = markerY(fret, position.baseFret || 1);
  return <line x1={start} y1={y} x2={end} y2={y} className="diagram-barre" />;
}

function DiagramSvg({ position, chordSymbol }: { position: ChordPosition; chordSymbol: string }) {
  const baseFret = position.baseFret || 1;
  const barres = position.barres ?? [];

  return (
    <svg className="chord-svg" viewBox="0 0 146 150" role="img" aria-label={`Posición de ${chordSymbol} en guitarra`}>
      <title>{`Diagrama de guitarra para ${chordSymbol}`}</title>

      {Array.from({ length: SHOWN_FRETS + 1 }, (_, index) => (
        <line
          key={`fret-${index}`}
          x1="18"
          y1={TOP + index * FRET_GAP}
          x2="128"
          y2={TOP + index * FRET_GAP}
          className={index === 0 && baseFret === 1 ? 'diagram-nut' : 'diagram-fret'}
        />
      ))}

      {STRING_X.map((x, index) => (
        <line key={`string-${index}`} x1={x} y1={TOP} x2={x} y2={TOP + SHOWN_FRETS * FRET_GAP} className="diagram-string" />
      ))}

      {baseFret > 1 && <text x="3" y={TOP + 18} className="diagram-base-fret">{baseFret}fr</text>}

      {position.frets.map((fret, index) => {
        const x = STRING_X[index];
        if (fret === -1) return <text key={`mute-${index}`} x={x} y="17" textAnchor="middle" className="diagram-open">×</text>;
        if (fret === 0) return <circle key={`open-${index}`} cx={x} cy="13" r="4" className="diagram-open-circle" />;
        return null;
      })}

      {barres.map((fret) => <Barre key={`barre-${fret}`} fret={fret} position={position} />)}

      {position.frets.map((fret, index) => {
        if (fret <= 0) return null;
        const finger = position.fingers?.[index] ?? 0;
        return (
          <g key={`dot-${index}`}>
            <circle cx={STRING_X[index]} cy={markerY(fret, baseFret)} r="8" className="diagram-dot" />
            {finger > 0 && <text x={STRING_X[index]} y={markerY(fret, baseFret) + 3.5} textAnchor="middle" className="diagram-finger">{finger}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function ChordDiagram({ chordSymbol }: { chordSymbol: string }) {
  const lookup = getDiagramLookup(chordSymbol);
  const position = lookup.chordData?.positions?.[0];

  if (!lookup.chordData || !position) {
    return (
      <div className="chord-figure chord-figure--missing" aria-label={`Diagrama no disponible para ${chordSymbol}`}>
        <div className="missing-diagram" aria-hidden="true"><span>6</span><div className="missing-lines" /><span>1</span></div>
        <strong>{chordSymbol}</strong>
        <small>Sin digitación en la fuente</small>
      </div>
    );
  }

  return (
    <div className="chord-figure" aria-label={`Diagrama de guitarra para ${chordSymbol}`}>
      <div className="chord-svg-wrap"><DiagramSvg position={position} chordSymbol={chordSymbol} /></div>
      <strong>{chordSymbol}</strong>
      {!lookup.exact && <small>Forma simplificada</small>}
    </div>
  );
}
