import { Chord, Key, Note, Scale } from 'tonal';

export type ChordFamily = 'major' | 'minor' | 'dominant' | 'diminished' | 'augmented';
export type ScaleKind = 'major' | 'minor' | 'harmonic-minor';

export interface ParsedChordSymbol {
  original: string;
  normalized: string;
  base: string;
  root: string;
  suffix: string;
  bass: string | null;
  family: ChordFamily;
}

export interface ScaleInfo {
  name: string;
  notes: string[];
  degrees: string[];
  alternate?: { name: string; notes: string[] };
}

export interface ProgressionRecommendation {
  id: string;
  rank: number;
  chords: string[];
  roman: string[];
  popularity: 'Muy común' | 'Común' | 'Frecuente';
  genres: string[];
  emotion: string;
  scale: ScaleInfo;
}

export interface ProgressionResult {
  input: ParsedChordSymbol;
  tonalCenter: string;
  tonalCenterLabel: string;
  explanation: string;
  recommendations: ProgressionRecommendation[];
}

export class MusicInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MusicInputError';
  }
}

const DEGREE_LABELS: Record<ScaleKind, string[]> = {
  major: ['1', '2', '3', '4', '5', '6', '7'],
  minor: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
  'harmonic-minor': ['1', '2', '♭3', '4', '5', '♭6', '7']
};

interface Template {
  id: string;
  degreeIndexes: number[];
  roman: string[];
  popularity: ProgressionRecommendation['popularity'];
  genres: string[];
  emotion: string;
  scaleKind: ScaleKind;
}

const MAJOR_TEMPLATES: Template[] = [
  { id: 'major-pop', degreeIndexes: [0, 4, 5, 3], roman: ['I', 'V', 'vi', 'IV'], popularity: 'Muy común', genres: ['Pop', 'Rock', 'Worship'], emotion: 'Abierta y resolutiva. Combina impulso con una caída emocional suave antes de volver a una zona estable.', scaleKind: 'major' },
  { id: 'major-classic', degreeIndexes: [0, 3, 4, 0], roman: ['I', 'IV', 'V', 'I'], popularity: 'Muy común', genres: ['Rock', 'Country', 'Folk'], emotion: 'Directa y estable. La tensión del V hace que el regreso al acorde inicial se sienta claro y definitivo.', scaleKind: 'major' },
  { id: 'major-fifties', degreeIndexes: [0, 5, 3, 4], roman: ['I', 'vi', 'IV', 'V'], popularity: 'Muy común', genres: ['Balada', 'Doo-wop', 'Pop'], emotion: 'Nostálgica y romántica. Tiene movimiento circular y una resolución muy reconocible.', scaleKind: 'major' },
  { id: 'major-lift', degreeIndexes: [0, 2, 3, 4], roman: ['I', 'iii', 'IV', 'V'], popularity: 'Común', genres: ['Pop', 'Balada', 'Soul'], emotion: 'Ascendente y emotiva. Sube la energía de forma gradual sin sonar agresiva.', scaleKind: 'major' },
  { id: 'major-rock', degreeIndexes: [0, 4, 3, 0], roman: ['I', 'V', 'IV', 'I'], popularity: 'Frecuente', genres: ['Rock', 'Country', 'Blues pop'], emotion: 'Firme y enérgica. El cambio V–IV le da un carácter más crudo y menos sentimental.', scaleKind: 'major' }
];

const MINOR_TEMPLATES: Template[] = [
  { id: 'minor-pop', degreeIndexes: [0, 5, 2, 6], roman: ['i', 'VI', 'III', 'VII'], popularity: 'Muy común', genres: ['Pop', 'Alternative', 'Rock'], emotion: 'Melancólica pero amplia. Mantiene un color menor sin quedarse encerrada en tensión constante.', scaleKind: 'minor' },
  { id: 'minor-cadence', degreeIndexes: [0, 3, 4, 0], roman: ['i', 'iv', 'V', 'i'], popularity: 'Muy común', genres: ['Clásica', 'Flamenco', 'Metal'], emotion: 'Dramática y tensa. El V mayor crea una resolución fuerte y evidente hacia el acorde menor inicial.', scaleKind: 'harmonic-minor' },
  { id: 'minor-rock', degreeIndexes: [0, 6, 5, 6], roman: ['i', 'VII', 'VI', 'VII'], popularity: 'Común', genres: ['Rock', 'Metal', 'Alternative'], emotion: 'Oscura e insistente. Funciona bien para riffs, versos con peso o una sensación de avance contenido.', scaleKind: 'minor' },
  { id: 'minor-cinematic', degreeIndexes: [0, 2, 6, 5], roman: ['i', 'III', 'VII', 'VI'], popularity: 'Común', genres: ['Cinemática', 'Pop', 'Indie'], emotion: 'Nostálgica y expansiva. Abre el centro menor hacia acordes mayores sin perder su identidad emocional.', scaleKind: 'minor' },
  { id: 'minor-indie', degreeIndexes: [0, 3, 6, 2], roman: ['i', 'iv', 'VII', 'III'], popularity: 'Frecuente', genres: ['Indie', 'Balada', 'Folk'], emotion: 'Íntima y contemplativa. Tiene menos necesidad de resolver y deja una sensación más abierta.', scaleKind: 'minor' }
];

const DOMINANT_TEMPLATES: Template[] = [
  { id: 'dominant-resolve-pop', degreeIndexes: [4, 0, 5, 3], roman: ['V7', 'I', 'vi', 'IV'], popularity: 'Muy común', genres: ['Pop', 'Rock', 'Soul'], emotion: 'Tensa al inicio y luminosa al resolver. El acorde dominante empuja de inmediato hacia un centro estable.', scaleKind: 'major' },
  { id: 'dominant-classic', degreeIndexes: [4, 0, 3, 4], roman: ['V7', 'I', 'IV', 'V7'], popularity: 'Muy común', genres: ['Blues', 'Rock', 'Country'], emotion: 'Clásica y circular. Resuelve pronto, vuelve a generar tensión y queda lista para repetir.', scaleKind: 'major' },
  { id: 'dominant-deceptive', degreeIndexes: [4, 5, 3, 0], roman: ['V7', 'vi', 'IV', 'I'], popularity: 'Común', genres: ['Pop', 'Balada', 'Cinemática'], emotion: 'Expectante y emotiva. En vez de resolver de inmediato al I, cae al vi y prolonga la sensación de sorpresa.', scaleKind: 'major' },
  { id: 'dominant-motion', degreeIndexes: [4, 2, 5, 1], roman: ['V7', 'iii', 'vi', 'ii'], popularity: 'Común', genres: ['Soul', 'R&B', 'Jazz pop'], emotion: 'Fluida y sofisticada. Mantiene movimiento armónico sin cerrar demasiado pronto.', scaleKind: 'major' },
  { id: 'dominant-loop', degreeIndexes: [4, 0, 1, 4], roman: ['V7', 'I', 'ii', 'V7'], popularity: 'Frecuente', genres: ['Jazz pop', 'Soul', 'Funk'], emotion: 'Dinámica y funcional. La ruta I–ii–V deja un ciclo muy fácil de continuar o improvisar.', scaleKind: 'major' }
];

const DIMINISHED_TEMPLATES: Template[] = [
  { id: 'dim-leading', degreeIndexes: [6, 0, 3, 4], roman: ['vii°', 'I', 'IV', 'V'], popularity: 'Común', genres: ['Clásica', 'Jazz', 'Pop'], emotion: 'Inestable al comienzo y muy resolutiva. El disminuido funciona como acorde de paso hacia el I.', scaleKind: 'major' },
  { id: 'dim-to-six', degreeIndexes: [6, 5, 1, 4], roman: ['vii°', 'vi', 'ii', 'V'], popularity: 'Común', genres: ['Jazz', 'Soul', 'Balada'], emotion: 'Tensa y elegante. Evita la resolución inmediata y encadena funciones que mantienen el movimiento.', scaleKind: 'major' },
  { id: 'dim-cinematic', degreeIndexes: [6, 0, 5, 3], roman: ['vii°', 'I', 'vi', 'IV'], popularity: 'Frecuente', genres: ['Cinemática', 'Pop', 'Balada'], emotion: 'Suspensiva al inicio y después emocional. El contraste entre tensión y acordes diatónicos es muy marcado.', scaleKind: 'major' },
  { id: 'dim-classic', degreeIndexes: [6, 0, 4, 0], roman: ['vii°', 'I', 'V', 'I'], popularity: 'Frecuente', genres: ['Clásica', 'Gospel', 'Pop'], emotion: 'Formal y conclusiva. Tiene dos puntos claros de tensión y resolución.', scaleKind: 'major' },
  { id: 'dim-walk', degreeIndexes: [6, 2, 5, 1], roman: ['vii°', 'iii', 'vi', 'ii'], popularity: 'Frecuente', genres: ['Jazz', 'Neo-soul', 'R&B'], emotion: 'Inquieta y móvil. Sirve como entrada a una cadena armónica que puede seguir hacia V–I.', scaleKind: 'major' }
];

function normalizeUnicodeAccidentals(value: string): string {
  return value.replace(/♯/g, '#').replace(/♭/g, 'b');
}

function normalizePitchClass(note: string): string {
  const simplified = Note.simplify(note);
  return simplified || note;
}

function detectFamily(suffix: string): ChordFamily {
  const clean = suffix.replace(/[()\s]/g, '').toLowerCase();
  if (clean.includes('dim') || clean.includes('°') || clean === 'o' || clean.startsWith('o7')) return 'diminished';
  if (clean.includes('aug') || clean.startsWith('+')) return 'augmented';
  if (['7', '9', '11', '13'].includes(clean) || clean.startsWith('7sus')) return 'dominant';
  if ((clean === 'm' || clean.startsWith('m')) && !clean.startsWith('maj')) return 'minor';
  return 'major';
}

export function parseChordSymbol(value: string): ParsedChordSymbol {
  const original = value;
  const compact = normalizeUnicodeAccidentals(value.trim()).replace(/\s+/g, '');

  if (!compact) throw new MusicInputError('Escribe un acorde, por ejemplo C, Am, G o D7.');

  const slashParts = compact.split('/');
  if (slashParts.length > 2) throw new MusicInputError('La inversión del acorde no es válida. Usa un formato como C/E.');

  const baseRaw = slashParts[0];
  const bassRaw = slashParts[1] ?? null;
  const match = baseRaw.match(/^([A-Ga-g])([#b]?)(.*)$/);

  if (!match) throw new MusicInputError(`“${value}” no parece un acorde válido. Prueba C, Cm, C7, Cmaj7 o F#m7.`);

  const root = `${match[1].toUpperCase()}${match[2]}`;
  const suffix = match[3];
  const base = `${root}${suffix}`;
  const chord = Chord.get(base);

  if (chord.empty || !chord.tonic) throw new MusicInputError(`No reconozco “${value}” como acorde estándar. Revisa la raíz y el sufijo.`);

  let bass: string | null = null;
  if (bassRaw) {
    const bassMatch = bassRaw.match(/^([A-Ga-g])([#b]?)$/);
    if (!bassMatch) throw new MusicInputError('La nota de bajo de la inversión no es válida. Usa un formato como C/E o D/F#.');
    bass = `${bassMatch[1].toUpperCase()}${bassMatch[2]}`;
    if (Note.get(bass).empty) throw new MusicInputError('La nota de bajo de la inversión no es válida.');
  }

  const normalized = bass ? `${base}/${bass}` : base;
  return { original, normalized, base, root, suffix, bass, family: detectFamily(suffix) };
}

export function isValidChordSymbol(value: string): boolean {
  try {
    parseChordSymbol(value);
    return true;
  } catch {
    return false;
  }
}

function resolveContext(input: ParsedChordSymbol): { tonic: string; mode: 'major' | 'minor'; explanation: string } {
  if (input.family === 'dominant') {
    const tonic = normalizePitchClass(Note.transpose(input.root, '4P'));
    return { tonic, mode: 'major', explanation: `${input.normalized} tiene función dominante; la lectura más útil es V de ${tonic} mayor.` };
  }

  if (input.family === 'diminished') {
    const tonic = normalizePitchClass(Note.transpose(input.root, '2m'));
    return { tonic, mode: 'major', explanation: `${input.normalized} se interpreta como acorde de sensible (vii°) que resuelve naturalmente hacia ${tonic}.` };
  }

  if (input.family === 'minor') {
    return { tonic: input.root, mode: 'minor', explanation: `${input.normalized} se toma como centro menor para proponer progresiones prácticas alrededor de ${input.root} menor.` };
  }

  return { tonic: input.root, mode: 'major', explanation: `${input.normalized} se toma como centro mayor para construir progresiones diatónicas de uso común.` };
}

function templatesFor(input: ParsedChordSymbol): Template[] {
  if (input.family === 'dominant') return DOMINANT_TEMPLATES;
  if (input.family === 'diminished') return DIMINISHED_TEMPLATES;
  if (input.family === 'minor') return MINOR_TEMPLATES;
  return MAJOR_TEMPLATES;
}

function triadsFor(tonic: string, mode: 'major' | 'minor', scaleKind: ScaleKind): string[] {
  if (mode === 'major') return [...Key.majorKey(tonic).triads];
  const minor = Key.minorKey(tonic);
  return scaleKind === 'harmonic-minor' ? [...minor.harmonic.triads] : [...minor.natural.triads];
}

function scaleInfo(tonic: string, kind: ScaleKind, input: ParsedChordSymbol): ScaleInfo {
  const scaleName = kind === 'harmonic-minor' ? `${tonic} harmonic minor` : kind === 'minor' ? `${tonic} minor` : `${tonic} major`;
  const scale = Scale.get(scaleName);
  if (scale.empty || scale.notes.length === 0) throw new Error(`No se pudo construir la escala ${scaleName}.`);

  const alternateName = input.family === 'dominant'
    ? `${input.root} mixolydian`
    : kind === 'major'
      ? `${tonic} major pentatonic`
      : `${tonic} minor pentatonic`;
  const alternateScale = Scale.get(alternateName);

  return {
    name: scaleName,
    notes: [...scale.notes],
    degrees: [...DEGREE_LABELS[kind]],
    ...(!alternateScale.empty && alternateScale.notes.length ? { alternate: { name: alternateName, notes: [...alternateScale.notes] } } : {})
  };
}

export function generateProgressions(value: string): ProgressionResult {
  const input = parseChordSymbol(value);
  const context = resolveContext(input);
  const templates = templatesFor(input);

  const recommendations = templates.map((template, index): ProgressionRecommendation => {
    const triads = triadsFor(context.tonic, context.mode, template.scaleKind);
    if (triads.length < 7) throw new Error(`La librería musical no devolvió suficientes acordes para ${context.tonic}.`);

    const chords = template.degreeIndexes.map((degreeIndex) => triads[degreeIndex]);
    chords[0] = input.normalized;

    return {
      id: template.id,
      rank: index + 1,
      chords,
      roman: template.roman,
      popularity: template.popularity,
      genres: template.genres,
      emotion: template.emotion,
      scale: scaleInfo(context.tonic, template.scaleKind, input)
    };
  });

  return {
    input,
    tonalCenter: context.tonic,
    tonalCenterLabel: `${context.tonic} ${context.mode === 'major' ? 'mayor' : 'menor'}`,
    explanation: context.explanation,
    recommendations
  };
}
