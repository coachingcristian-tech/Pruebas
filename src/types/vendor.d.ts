declare module '@tombatossals/chords-db/lib/guitar.json' {
  const value: unknown;
  export default value;
}

declare module '@tombatossals/react-chords/lib/Chord' {
  import type { ComponentType } from 'react';

  type ChordPosition = {
    frets: number[];
    fingers: number[];
    barres?: number[];
    capo?: boolean;
    baseFret?: number;
  };

  type Instrument = {
    strings: number;
    fretsOnChord: number;
    name: string;
    keys: string[];
    tunings: Record<string, string[]>;
  };

  const Chord: ComponentType<{
    chord: ChordPosition;
    instrument: Instrument;
    lite?: boolean;
  }>;

  export default Chord;
}
