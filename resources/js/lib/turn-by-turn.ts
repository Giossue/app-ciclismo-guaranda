/**
 * Guiado turn-by-turn sobre pasos de OSRM: traduce maniobras a español y
 * calcula el progreso del ciclista proyectando su posición sobre la línea.
 */

export type ApproachManeuver = {
    type: string;
    modifier: string | null;
    exit: number | null;
    location: [number, number];
};

/** Paso tal como lo entrega el backend; coordenadas en [lng, lat] (GeoJSON). */
export type ApproachStep = {
    distance_m: number;
    name: string;
    maneuver: ApproachManeuver;
    coordinates: [number, number][];
};

export type ManeuverDirection =
    'left' | 'right' | 'straight' | 'uturn' | 'depart' | 'arrive';

/** Paso listo para la interfaz; posiciones en [lat, lng] (Leaflet). */
export type NavigationStep = {
    instruction: string;
    direction: ManeuverDirection;
    positions: [number, number][];
};

export type NavigationProgress = {
    stepIndex: number;
    /** Metros hasta la siguiente maniobra (el inicio del paso siguiente). */
    distanceToManeuverM: number;
    remainingM: number;
    offRouteM: number;
};

const sideNames: Record<string, string> = {
    left: 'izquierda',
    right: 'derecha',
    'slight left': 'izquierda',
    'slight right': 'derecha',
    'sharp left': 'izquierda',
    'sharp right': 'derecha',
};

function sideName(modifier: string | null): string | null {
    return modifier ? (sideNames[modifier] ?? null) : null;
}

function onStreet(name: string): string {
    return name ? ` en ${name}` : '';
}

function turnInstruction(modifier: string | null, name: string): string {
    if (modifier === 'uturn') {
        return 'Haz un giro en U';
    }

    if (modifier === 'straight' || !modifier) {
        return `Sigue recto${onStreet(name)}`;
    }

    const side = sideName(modifier) ?? modifier;
    const nuance = modifier.startsWith('slight')
        ? 'levemente '
        : modifier.startsWith('sharp')
          ? 'cerrado '
          : '';

    return `Gira ${nuance}a la ${side}${onStreet(name)}`;
}

export function maneuverInstruction(step: ApproachStep): string {
    const { type, modifier, exit } = step.maneuver;
    const name = step.name;

    switch (type) {
        case 'depart':
            return name ? `Dirígete por ${name}` : 'Inicia el recorrido';
        case 'arrive':
            return 'Has llegado al punto de partida de la ruta';
        case 'turn':
        case 'continue':
            return turnInstruction(modifier, name);
        case 'new name':
            return `Continúa${onStreet(name)}`;
        case 'merge':
            return `Incorpórate${onStreet(name)}`;
        case 'on ramp':
            return `Toma el acceso${onStreet(name)}`;
        case 'off ramp':
            return `Toma la salida${onStreet(name)}`;
        case 'fork': {
            const side = sideName(modifier);

            return side
                ? `En la bifurcación, mantente a la ${side}${onStreet(name)}`
                : `Continúa por la bifurcación${onStreet(name)}`;
        }
        case 'end of road': {
            const side = sideName(modifier);

            return side
                ? `Al final de la calle, gira a la ${side}${onStreet(name)}`
                : `Continúa al final de la calle${onStreet(name)}`;
        }
        case 'roundabout':
        case 'rotary':
            return exit
                ? `En la rotonda, toma la salida ${exit}${onStreet(name)}`
                : `Entra a la rotonda${onStreet(name)}`;
        case 'exit roundabout':
        case 'exit rotary':
            return `Sal de la rotonda${onStreet(name)}`;
        default:
            return turnInstruction(modifier, name);
    }
}

export function maneuverDirection(step: ApproachStep): ManeuverDirection {
    const { type, modifier } = step.maneuver;

    if (type === 'depart') {
        return 'depart';
    }

    if (type === 'arrive') {
        return 'arrive';
    }

    if (modifier === 'uturn') {
        return 'uturn';
    }

    if (modifier?.includes('left')) {
        return 'left';
    }

    if (modifier?.includes('right')) {
        return 'right';
    }

    return 'straight';
}

export function buildNavigationSteps(steps: ApproachStep[]): NavigationStep[] {
    return steps.map((step) => ({
        instruction: maneuverInstruction(step),
        direction: maneuverDirection(step),
        positions: step.coordinates.map(
            ([longitude, latitude]): [number, number] => [latitude, longitude],
        ),
    }));
}

const earthRadiusM = 6371000;

function degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
}

export function distanceMeters(
    from: [number, number],
    to: [number, number],
): number {
    const latitudeDelta = degreesToRadians(to[0] - from[0]);
    const longitudeDelta = degreesToRadians(to[1] - from[1]);
    const fromLat = degreesToRadians(from[0]);
    const toLat = degreesToRadians(to[0]);

    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(fromLat) * Math.cos(toLat) * Math.sin(longitudeDelta / 2) ** 2;

    return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Proyección plana local: a escala de ciudad el error es despreciable y evita
 * trigonometría esférica por cada segmento.
 */
function projectOnSegment(
    point: [number, number],
    start: [number, number],
    end: [number, number],
): { distanceM: number; t: number } {
    const metersPerLatDegree = 111320;
    const metersPerLngDegree =
        metersPerLatDegree * Math.cos(degreesToRadians(point[0]));

    const px = (point[1] - start[1]) * metersPerLngDegree;
    const py = (point[0] - start[0]) * metersPerLatDegree;
    const ex = (end[1] - start[1]) * metersPerLngDegree;
    const ey = (end[0] - start[0]) * metersPerLatDegree;

    const lengthSquared = ex * ex + ey * ey;
    const t =
        lengthSquared === 0
            ? 0
            : Math.max(0, Math.min(1, (px * ex + py * ey) / lengthSquared));

    const dx = px - t * ex;
    const dy = py - t * ey;

    return { distanceM: Math.sqrt(dx * dx + dy * dy), t };
}

function segmentLengthM(step: NavigationStep, index: number): number {
    return distanceMeters(step.positions[index], step.positions[index + 1]);
}

export function computeProgress(
    steps: NavigationStep[],
    position: [number, number],
): NavigationProgress {
    let best = {
        stepIndex: 0,
        segmentIndex: 0,
        t: 0,
        distanceM: Number.POSITIVE_INFINITY,
    };

    steps.forEach((step, stepIndex) => {
        for (let index = 0; index < step.positions.length - 1; index++) {
            const projection = projectOnSegment(
                position,
                step.positions[index],
                step.positions[index + 1],
            );

            if (projection.distanceM < best.distanceM) {
                best = {
                    stepIndex,
                    segmentIndex: index,
                    t: projection.t,
                    distanceM: projection.distanceM,
                };
            }
        }
    });

    const currentStep = steps[best.stepIndex];
    let distanceToManeuverM = 0;

    if (currentStep && currentStep.positions.length > 1) {
        distanceToManeuverM +=
            segmentLengthM(currentStep, best.segmentIndex) * (1 - best.t);

        for (
            let index = best.segmentIndex + 1;
            index < currentStep.positions.length - 1;
            index++
        ) {
            distanceToManeuverM += segmentLengthM(currentStep, index);
        }
    }

    let remainingM = distanceToManeuverM;

    for (
        let stepIndex = best.stepIndex + 1;
        stepIndex < steps.length;
        stepIndex++
    ) {
        for (
            let index = 0;
            index < steps[stepIndex].positions.length - 1;
            index++
        ) {
            remainingM += segmentLengthM(steps[stepIndex], index);
        }
    }

    return {
        stepIndex: best.stepIndex,
        distanceToManeuverM,
        remainingM,
        offRouteM: best.distanceM,
    };
}

export function formatMeters(meters: number): string {
    if (meters < 950) {
        return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
    }

    return `${(meters / 1000).toFixed(1)} km`;
}
