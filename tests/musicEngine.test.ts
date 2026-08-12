import { describe, expect, it } from 'vitest';
import { generateProgressions, isValidChordSymbol, parseChordSymbol } from '../src/lib/musicEngine';

describe('validación de acordes', () => {
  it.each(['C', 'Am', 'G', 'D7', 'Cmaj7', 'F#m7', 'Bbmaj7', 'C/E'])('acepta %s', (symbol) => {
    expect(isValidChordSymbol(symbol)).toBe(true);
  });

  it.each(['', 'H7', 'Cfoo', '7C', 'C//E'])('rechaza %s', (symbol) => {
    expect(isValidChordSymbol(symbol)).toBe(false);
  });

  it('normaliza alteraciones unicode', () => {
    expect(parseChordSymbol('F♯m7').normalized).toBe('F#m7');
  });
});

describe('generación de progresiones', () => {
  it('genera cinco progresiones mayores que empiezan con el acorde exacto', () => {
    const result = generateProgressions('C');
    expect(result.tonalCenterLabel).toBe('C mayor');
    expect(result.recommendations).toHaveLength(5);
    expect(result.recommendations.every((item) => item.chords[0] === 'C')).toBe(true);
    expect(result.recommendations[0].chords).toEqual(['C', 'G', 'Am', 'F']);
  });

  it('genera progresiones menores alrededor de Am', () => {
    const result = generateProgressions('Am');
    expect(result.tonalCenterLabel).toBe('A menor');
    expect(result.recommendations[0].chords).toEqual(['Am', 'F', 'C', 'G']);
    expect(result.recommendations[1].chords).toEqual(['Am', 'Dm', 'E', 'Am']);
  });

  it('interpreta D7 como dominante de G mayor', () => {
    const result = generateProgressions('D7');
    expect(result.tonalCenterLabel).toBe('G mayor');
    expect(result.recommendations[0].chords).toEqual(['D7', 'G', 'Em', 'C']);
  });
});

describe('mapeo de escalas', () => {
  it('expone notas y grados de C mayor', () => {
    const scale = generateProgressions('C').recommendations[0].scale;
    expect(scale.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(scale.degrees).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('usa menor armónica para la cadencia i-iv-V-i', () => {
    const scale = generateProgressions('Am').recommendations[1].scale;
    expect(scale.name).toBe('A harmonic minor');
    expect(scale.notes).toContain('G#');
    expect(scale.degrees[6]).toBe('7');
  });
});

describe('fuente externa de diagramas', () => {
  it('resuelve una digitación real para C sin inventar datos', async () => {
    const { getDiagramLookup } = await import('../src/lib/chordDb');
    const lookup = getDiagramLookup('C');
    expect(lookup.chordData).not.toBeNull();
    expect(lookup.chordData?.positions.length).toBeGreaterThan(0);
    expect(lookup.exact).toBe(true);
  });
});
