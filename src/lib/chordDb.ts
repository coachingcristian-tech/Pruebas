import guitarChordsDb from '@tombatossals/chords-db/lib/guitar.json';
import { parseChordSymbol } from './musicEngine';

export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
}

export interface ChordData {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

interface ChordDatabase {
  main: {
    strings: number;
    fretsOnChord: number;
    name: string;
    numberOfChords: number;
  };
  tunings: {
    standard: string[];
  };
  keys: string[];
  suffixes: string[];
  chords: Record<string, ChordData[]>;
}

export interface DiagramLookup {
  chordData: ChordData | null;
  exact: boolean;
  resolvedSuffix: string | null;
}

const db = guitarChordsDb as ChordDatabase;

const ROOT_MAP: Record<string, string> = {
  'C#': 'Csharp',
  Db: 'Csharp',
  'D#': 'Eb',
  Gb: 'Fsharp',
  'F#': 'Fsharp',
  'G#': 'Ab',
  'A#': 'Bb',
  Cb: 'B',
  Fb: 'E',
  'E#': 'F',
  'B#': 'C'
};

const SUFFIX_MAP: Record<string, string> = {
  '': 'major',
  maj: 'major',
  M: 'major',
  m: 'minor',
  min: 'minor',
  '-': 'minor',
  dim: 'dim',
  '°': 'dim',
  o: 'dim',
  dim7: 'dim7',
  '°7': 'dim7',
  aug: 'aug',
  '+': 'aug',
  sus: 'sus4',
  sus2: 'sus2',
  sus4: 'sus4',
  '6': '6',
  m6: 'm6',
  '7': '7',
  maj7: 'maj7',
  M7: 'maj7',
  m7: 'm7',
  min7: 'm7',
  m7b5: 'm7b5',
  '9': '9',
  maj9: 'maj9',
  m9: 'm9',
  '11': '11',
  m11: 'm11',
  '13': '13',
  m13: 'm13',
  add9: 'add9',
  madd9: 'madd9',
  maj11: 'maj11',
  maj13: 'maj13',
  mMaj7: 'mMaj7'
};

function normalizedRoot(root: string): string {
  return ROOT_MAP[root] ?? root;
}

function normalizedSuffix(suffix: string): string {
  return SUFFIX_MAP[suffix] ?? SUFFIX_MAP[suffix.toLowerCase()] ?? suffix;
}

function fallbackSuffixes(suffix: string): string[] {
  if (['m13', 'm11', 'm9'].includes(suffix)) return ['m7', 'minor'];
  if (['maj13', 'maj11', 'maj9'].includes(suffix)) return ['maj7', 'major'];
  if (['13', '11', '9'].includes(suffix)) return ['7', 'major'];
  if (suffix === 'mMaj7') return ['m7', 'minor'];
  if (suffix === 'add9') return ['major'];
  if (suffix === 'madd9') return ['minor'];
  return [];
}

export function getDiagramLookup(chordSymbol: string): DiagramLookup {
  try {
    const parsed = parseChordSymbol(chordSymbol);
    const rootChords = db.chords[normalizedRoot(parsed.root)];
    if (!rootChords) return { chordData: null, exact: false, resolvedSuffix: null };

    const suffix = normalizedSuffix(parsed.suffix);

    if (parsed.bass) {
      const slashSuffix = `${suffix === 'major' ? '' : suffix}/${parsed.bass}`;
      const slashMatch = rootChords.find((candidate) => candidate.suffix === slashSuffix);
      if (slashMatch) return { chordData: slashMatch, exact: true, resolvedSuffix: slashSuffix };
    }

    const exactMatch = rootChords.find((candidate) => candidate.suffix === suffix);
    if (exactMatch) return { chordData: exactMatch, exact: true, resolvedSuffix: suffix };

    for (const fallback of fallbackSuffixes(suffix)) {
      const match = rootChords.find((candidate) => candidate.suffix === fallback);
      if (match) return { chordData: match, exact: false, resolvedSuffix: fallback };
    }

    return { chordData: null, exact: false, resolvedSuffix: null };
  } catch {
    return { chordData: null, exact: false, resolvedSuffix: null };
  }
}

export function chordDbStats(): { numberOfChords: number; numberOfVoicings: number; keys: number; suffixes: number } {
  const numberOfVoicings = Object.values(db.chords)
    .flat()
    .reduce((total, chord) => total + (chord.positions?.length ?? 0), 0);

  return {
    numberOfChords: db.main.numberOfChords,
    numberOfVoicings,
    keys: db.keys.length,
    suffixes: db.suffixes.length
  };
}
