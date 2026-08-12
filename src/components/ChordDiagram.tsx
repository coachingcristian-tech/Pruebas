import Chord from '@tombatossals/react-chords/lib/Chord';
import { getDiagramLookup } from '../lib/chordDb';

const GUITAR_INSTRUMENT = {
  strings: 6,
  fretsOnChord: 4,
  name: 'Guitar',
  keys: [],
  tunings: {
    standard: ['E', 'A', 'D', 'G', 'B', 'E']
  }
};

export function ChordDiagram({ chordSymbol }: { chordSymbol: string }) {
  const lookup = getDiagramLookup(chordSymbol);
  const position = lookup.chordData?.positions?.[0];

  if (!lookup.chordData || !position) {
    return (
      <div className="chord-figure chord-figure--missing" aria-label={`Diagrama no disponible para ${chordSymbol}`}>
        <div className="missing-diagram" aria-hidden="true">
          <span>6</span>
          <div className="missing-lines" />
          <span>1</span>
        </div>
        <strong>{chordSymbol}</strong>
        <small>Sin digitación en la fuente</small>
      </div>
    );
  }

  const diagramChord = {
    frets: position.frets,
    fingers: position.fingers,
    barres: position.barres ?? [],
    capo: position.capo ?? false,
    baseFret: position.baseFret || 1
  };

  return (
    <div className="chord-figure" aria-label={`Diagrama de guitarra para ${chordSymbol}`}>
      <div className="chord-svg-wrap">
        <Chord chord={diagramChord} instrument={GUITAR_INSTRUMENT} lite={false} />
      </div>
      <strong>{chordSymbol}</strong>
      {!lookup.exact && <small>Forma simplificada</small>}
    </div>
  );
}
