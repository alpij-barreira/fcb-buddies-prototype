/* Datos de demo — escenarios por ciudad y geolocalización */

const CITIES = {
  barcelona: { name: 'Barcelona', lat: 41.3874, lng: 2.1686, zoom: 14 },
  madrid: { name: 'Madrid', lat: 40.4168, lng: -3.7038, zoom: 13 },
  valencia: { name: 'Valencia', lat: 39.4699, lng: -0.3763, zoom: 13 },
};

const CITY_ALIASES = {
  barcelona: 'barcelona',
  bcn: 'barcelona',
  'barça': 'barcelona',
  barca: 'barcelona',
  madrid: 'madrid',
  valencia: 'valencia',
};

/** Plantillas sin coordenadas — se colocan al azar al cargar el escenario */
const EVENT_TEMPLATES = {
  geo: [
    {
      id: 'geo-1',
      matchId: 'match-m-clasico',
      name: 'Clásico en Bar Leo',
      location: 'Bar Leo, Gràcia',
      address: 'Carrer de la Revolució, 17',
      category: 'classic',
      spaceType: 'bar',
      capacity: 40,
      reserved: 28,
    },
    {
      id: 'geo-2',
      matchId: 'match-m-clasico',
      name: 'Viewing Party Eixample',
      location: 'Café de la Pedrera',
      address: 'Passeig de Gràcia, 92',
      category: 'community',
      spaceType: 'bar',
      capacity: 25,
      reserved: 12,
    },
    {
      id: 'geo-3',
      matchId: 'match-m-clasico',
      name: 'Peña Barcelonista Poblenou',
      location: 'Local Peña Poblenou',
      address: 'Carrer de Pujades, 56',
      category: 'pena',
      spaceType: 'pena',
      capacity: 60,
      reserved: 45,
    },
    {
      id: 'geo-4',
      matchId: 'match-m-clasico',
      name: 'Casa de Marc — Clásico',
      location: 'Sants',
      address: 'Carrer de Sants, 120',
      category: 'community',
      spaceType: 'casa',
      capacity: 12,
      reserved: 8,
    },
  ],
  barcelona: [
    {
      id: 'bcn-1',
      matchId: 'match-m-clasico',
      name: 'Clásico en Belushi\'s',
      location: 'Belushi\'s Bar, Gòtic',
      address: 'Carrer de Ferran, 6',
      category: 'classic',
      spaceType: 'bar',
      capacity: 50,
      reserved: 35,
    },
    {
      id: 'bcn-2',
      matchId: 'match-m-clasico',
      name: 'Grupo culés Born',
      location: 'El Born Centre',
      address: 'Plaça Comercial, 12',
      category: 'community',
      spaceType: 'bar',
      capacity: 30,
      reserved: 18,
    },
    {
      id: 'bcn-3',
      matchId: 'match-m-clasico',
      name: 'Peña Barcelonista',
      location: 'Poblenou',
      address: 'Carrer de Pujades, 56',
      category: 'pena',
      spaceType: 'pena',
      capacity: 60,
      reserved: 45,
    },
  ],
  madrid: [
    {
      id: 'mad-1',
      matchId: 'match-m-clasico',
      name: 'Madrid Culés — Clásico',
      location: 'Irish Pub Malasaña',
      address: 'Calle de Manuela Malasaña, 10',
      category: 'classic',
      spaceType: 'bar',
      capacity: 35,
      reserved: 22,
    },
    {
      id: 'mad-2',
      matchId: 'match-m-clasico',
      name: 'Viewing Party Chamberí',
      location: 'Bar Deportivo Chamberí',
      address: 'Calle de Bravo Murillo, 88',
      category: 'community',
      spaceType: 'bar',
      capacity: 20,
      reserved: 14,
    },
  ],
  valencia: [
    {
      id: 'val-1',
      matchId: 'match-m-clasico',
      name: 'Peña Valenciana Blaugrana',
      location: 'Bar El Turia',
      address: 'Carrer de Xàtiva, 28',
      category: 'pena',
      spaceType: 'pena',
      capacity: 45,
      reserved: 31,
    },
  ],
};

const FILTER_OPTIONS = {
  spaceType: [
    { id: 'bar', label: 'Bar / local' },
    { id: 'casa', label: 'Casa' },
    { id: 'pena', label: 'Peña' },
  ],
  category: [
    { id: 'classic', label: 'Clásico' },
    { id: 'community', label: 'Comunidad' },
    { id: 'pena', label: 'Peña' },
  ],
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function resolveCity(query) {
  const key = query.trim().toLowerCase();
  return CITY_ALIASES[key] || null;
}

function randomPointNear(centerLat, centerLng, minKm, maxKm) {
  const angle = Math.random() * Math.PI * 2;
  const distKm = minKm + Math.random() * (maxKm - minKm);
  const lat =
    centerLat + (distKm / 111.32) * Math.cos(angle);
  const lng =
    centerLng +
    (distKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angle);
  return { lat, lng, distanceKm: distKm };
}

/**
 * Coloca eventos al azar cerca del centro del mapa.
 * Si el partido seleccionado no tiene eventos, devuelve lista vacía.
 */
function spawnEventsForScenario(hasGeo, cityKey, center, selectedMatch, filterByMatch = true) {
  if (filterByMatch && selectedMatch && !matchHasEvents(selectedMatch)) {
    return [];
  }

  const key = hasGeo ? 'geo' : cityKey;
  const templates = EVENT_TEMPLATES[key] || [];

  const spread = hasGeo
    ? { min: 0.4, max: 4.5, withDistance: true }
    : { min: 0.8, max: 5.5, withDistance: false };

  return templates.map((tpl) => {
    const point = randomPointNear(center.lat, center.lng, spread.min, spread.max);
    const event = {
      ...tpl,
      matchId: selectedMatch?.id || tpl.matchId,
      lat: point.lat,
      lng: point.lng,
    };
    if (spread.withDistance) {
      event.distanceKm = haversineKm(
        center.lat,
        center.lng,
        point.lat,
        point.lng
      );
    }
    return event;
  });
}

function filterEvents(events, { radiusKm, filters, hasGeo }) {
  return events
    .filter((event) => {
      if (filters.spaceType.length && !filters.spaceType.includes(event.spaceType)) {
        return false;
      }
      if (filters.category.length && !filters.category.includes(event.category)) {
        return false;
      }
      if (hasGeo && event.distanceKm !== undefined && event.distanceKm > radiusKm) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
}
