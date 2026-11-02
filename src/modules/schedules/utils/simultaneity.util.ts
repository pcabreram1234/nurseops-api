/**
 * Utilidades de "simultaneidad" de turnos.
 *
 * Dos enfermeras son simultáneas si sus turnos se solapan en el tiempo dentro
 * del mismo día. Se usa para la restricción operativa configurable por
 * departamento: `DepartmentConfiguration.maxSimultaneousNurses`
 * (null = sin límite).
 */

export interface TimeWindowLike {
  startTime: string | Date;
  endTime: string | Date;
  isNightShift?: boolean;
}

/** Convierte "HH:mm" o Date a minutos desde la medianoche. */
function toMinutes(value: string | Date): number {
  if (value instanceof Date) {
    return value.getHours() * 60 + value.getMinutes();
  }
  const [h, m] = String(value).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Ventana en minutos [inicio, fin]. Los turnos nocturnos (o que cruzan la
 * medianoche) se proyectan más allá de 1440 minutos para poder compararlos.
 */
export function windowMinutes(w: TimeWindowLike): [number, number] {
  let start = toMinutes(w.startTime);
  let end = toMinutes(w.endTime);
  if (end <= start || w.isNightShift) {
    end += 24 * 60;
  }
  return [start, end];
}

/** ¿Dos turnos del mismo día se solapan en el tiempo? */
export function windowsOverlap(a: TimeWindowLike, b: TimeWindowLike): boolean {
  const [as, ae] = windowMinutes(a);
  const [bs, be] = windowMinutes(b);
  return as < be && bs < ae;
}

/**
 * Máximo de ventanas simultáneas (sweep line). Devuelve la mayor cantidad de
 * turnos que coinciden en un mismo instante.
 */
export function maxConcurrentWindows(windows: TimeWindowLike[]): number {
  const events: Array<{ minute: number; delta: number }> = [];
  for (const w of windows) {
    const [s, e] = windowMinutes(w);
    events.push({ minute: s, delta: 1 });
    events.push({ minute: e, delta: -1 });
  }
  // Ordenar por minuto; los cierres (-1) antes que las aperturas (+1) en el
  // mismo minuto para no contar como solapados turnos que se tocan de punta.
  events.sort((a, b) => a.minute - b.minute || a.delta - b.delta);

  let current = 0;
  let max = 0;
  for (const ev of events) {
    current += ev.delta;
    if (current > max) max = current;
  }
  return max;
}
