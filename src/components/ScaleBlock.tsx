import type { ScaleInfo } from '../lib/musicEngine';

export function ScaleBlock({ scale }: { scale: ScaleInfo }) {
  return (
    <section className="scale-block" aria-label={`Escala ${scale.name}`}>
      <div className="section-kicker">Escala para improvisar</div>
      <h4>{scale.name}</h4>
      <div className="scale-notes">
        {scale.notes.map((note, index) => (
          <span className="scale-note" key={`${note}-${index}`}>
            <b>{note}</b>
            <small>{scale.degrees[index] ?? index + 1}</small>
          </span>
        ))}
      </div>
      {scale.alternate && (
        <p className="alternate-scale">
          Alternativa: <strong>{scale.alternate.name}</strong> · {scale.alternate.notes.join(' – ')}
        </p>
      )}
    </section>
  );
}
