# ChordPath

Aplicación web responsive para convertir un acorde inicial en progresiones tocables de guitarra. El usuario escribe `C`, `Am`, `G`, `D7`, `Cmaj7`, `F#m7`, etc. y recibe cinco progresiones ordenadas por uso común con diagramas, sensación musical y escalas para improvisar.

## Qué entrega

- 5 progresiones por consulta, siempre comenzando con el acorde ingresado.
- Contexto tonal inferido. Ejemplo: `D7` se interpreta como V7 de G mayor.
- Diagramas de guitarra obtenidos de una base externa de digitaciones.
- Descripción breve de la sensación de cada progresión.
- Escala principal, notas y grados para improvisación.
- Escala alternativa útil (pentatónica o mixolidia cuando corresponde).
- Validación clara de entradas inválidas.
- Diseño responsive para escritorio y móvil.
- Manifest web para una experiencia más cercana a una app instalada.

## Stack

- **React 19 + TypeScript**: UI componentizada, tipada y fácil de mantener con herramientas como Codex.
- **Vite**: desarrollo y build de producción rápidos.
- **Tonal**: librería externa de teoría musical. Se usa para validar acordes, transponer, resolver tonalidades y generar escalas/notas. No se mantiene una base propia de teoría.
- **@tombatossals/chords-db**: base MIT externa de digitaciones de instrumentos de cuerda. Se utiliza `lib/guitar.json` para las posiciones.
- **@tombatossals/react-chords**: render SVG de las posiciones provenientes de `chords-db`.
- **Vitest + Testing Library + jsdom**: pruebas unitarias y de integración.

La justificación resumida de cada dependencia también está declarada en `package.json` dentro de `dependencyNotes`.

## Instalación

Requisitos: Node.js 22.12 o superior y npm 10 o superior.

```bash
npm install
npm run dev
```

Abrir la URL indicada por Vite, normalmente `http://localhost:5173`.

## Verificación completa

```bash
npm run verify
```

Ese comando ejecuta primero las pruebas y luego el build con chequeo TypeScript.

Comandos separados:

```bash
npm run test
npm run build
npm run preview
```

## Uso

1. Escribe un acorde en el campo principal.
2. Presiona **Generar** o Enter.
3. Revisa las progresiones en orden de uso común.
4. Usa los diagramas para tocar cada acorde.
5. En “Escala para improvisar”, usa las notas y grados como material melódico.
6. El botón **Copiar** copia la progresión al portapapeles.

### Notación aceptada

Ejemplos probados:

- Mayores: `C`, `G`, `Bb`
- Menores: `Am`, `F#m`
- Séptimas: `D7`, `Cmaj7`, `Am7`
- Extensiones reconocidas por Tonal: `C9`, `Dm9`, `Cadd9`, etc.
- Inversiones: `C/E`, `D/F#`
- Alteraciones Unicode: `F♯m7`, `B♭maj7`

La validación musical se delega a Tonal. Si Tonal reconoce un acorde pero `chords-db` no incluye una digitación exacta, ChordPath mantiene la recomendación teórica y muestra un estado explícito en el diagrama en lugar de inventar una posición.

## Cómo se generan las progresiones

La app usa reglas funcionales simples y verificables, no un LLM por consulta:

- Acorde mayor o mayor extendido: normalmente se toma como **I** del centro mayor.
- Acorde menor: normalmente se toma como **i** del centro menor.
- Dominante (`7`, `9`, `11`, `13`): se interpreta como **V** de la tonalidad mayor que resuelve una cuarta justa arriba. Ejemplo: `D7 → G mayor`.
- Disminuido: se interpreta como acorde de sensible **vii°** cuando existe una resolución diatónica razonable.

Las plantillas se ordenan por uso extendido en pop, rock, balada, country, soul, jazz pop, etc. No representan estadísticas de streaming ni un ranking absoluto; “Muy común / Común / Frecuente” es una clasificación editorial basada en práctica armónica general.

## Escalas

- Progresiones mayores: escala mayor del centro tonal y pentatónica mayor como alternativa.
- Progresiones menores: menor natural; la cadencia `i–iv–V–i` usa menor armónica para justificar el V mayor.
- Acordes dominantes: escala mayor del centro de resolución y mixolidia sobre el acorde dominante como alternativa.

## Diagramas de guitarra

La fuente de digitaciones es `@tombatossals/chords-db`, no una tabla creada para este proyecto. El render se hace en SVG con `@tombatossals/react-chords`, por lo que se mantiene nítido en pantallas móviles y de alta densidad.

Para extensiones sin forma exacta disponible, el adaptador puede usar una forma simplificada relacionada solo cuando existe una reducción clara (`m13 → m7`, `maj13 → maj7`, `13 → 7`). La interfaz marca esas formas como **Forma simplificada**.

## Compatibilidad y alcance

ChordPath acepta símbolos de acordes estándar, la misma clase de notación utilizada por herramientas como TuxGuitar/Guitar Pro. Esta versión **no abre ni exporta archivos `.gp5/.gpx/.tg`**; esa sería una capa de importación/exportación separada. El motor está desacoplado de la UI para poder añadirla después sin rehacer la lógica principal.

## Manejo de errores

- Entrada vacía: instrucción concreta para escribir un acorde.
- Raíz inválida: error antes de generar resultados.
- Sufijo no reconocido por Tonal: error de notación.
- Inversión inválida: error específico de bajo.
- Digitación inexistente: la progresión sigue visible, pero el diagrama declara que la fuente no tiene esa posición.
- Fallo inesperado del motor: mensaje genérico sin romper la interfaz.

## Tests

`tests/musicEngine.test.ts` cubre:

- acordes válidos e inválidos;
- normalización de alteraciones;
- progresiones de C y Am;
- resolución dominante de D7 a G mayor;
- notas y grados de escalas;
- menor armónica para `i–iv–V–i`;
- consulta real de una digitación en la fuente externa.

`tests/App.integration.test.tsx` cubre el flujo de usuario:

- escribir `D7`, generar y ver `D7 → G → Em → C`;
- escribir una entrada inválida y recibir un error accesible.

GitHub Actions ejecuta `npm install`, tests y build en cada push a `main` y en pull requests.

## Producción

Build:

```bash
npm run build
```

La salida queda en `dist/` y puede desplegarse en Vercel como proyecto Vite sin variables de entorno. No requiere Supabase, base de datos ni API key para la funcionalidad principal.

### Configuración recomendada en Vercel

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.x

## Fuentes y licencias

- Tonal: MIT — teoría musical en JavaScript/TypeScript.
- tombatossals/chords-db: MIT — base de acordes para instrumentos de cuerda.
- tombatossals/react-chords: render de diagramas SVG basado en esa estructura.

Revisar las licencias de dependencias al redistribuir el producto como parte de un paquete comercial.
