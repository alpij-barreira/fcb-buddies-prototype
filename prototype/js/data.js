/* Datos de demo — escenarios por ciudad y geolocalización */

const CITIES = {
  london:    { name: 'Londres',    lat: 51.5074, lng: -0.1278, zoom: 13 },
  amsterdam: { name: 'Ámsterdam',  lat: 52.3676, lng:  4.9041, zoom: 13 },
  paris:     { name: 'París',      lat: 48.8566, lng:  2.3522, zoom: 13 },
};

const CITY_ALIASES = {
  london:    'london',
  londres:   'london',
  ldn:       'london',
  amsterdam: 'amsterdam',
  ámsterdam: 'amsterdam',
  ams:       'amsterdam',
  paris:     'paris',
  parís:     'paris',
};

/** Plantillas sin coordenadas — se colocan al azar al cargar el escenario */
const EVENT_TEMPLATES = {

  /* ── Eventos de geolocalización (3, distancias escalonadas) ── */
  geo: [
    {
      id: 'geo-1',
      matchId: 'match-m-clasico',
      name: 'Sports Bar cercano — El Clásico',
      location: 'Bar deportivo',
      address: 'A menos de 1 km de ti',
      category: 'classic',
      spaceType: 'bar',
      capacity: 40,
      reserved: 27,
      distRange: { min: 0.4, max: 1.2 },
    },
    {
      id: 'geo-2',
      matchId: 'match-m-clasico',
      name: 'Viewing Party — Culés abroad',
      location: 'Comunidad local',
      address: 'A menos de 3 km de ti',
      category: 'community',
      spaceType: 'casa',
      capacity: 15,
      reserved: 9,
      distRange: { min: 1.5, max: 3.0 },
    },
    {
      id: 'geo-3',
      matchId: 'match-m-clasico',
      name: 'Peña Barcelonista — zona',
      location: 'Peña barcelonista',
      address: 'A menos de 6 km de ti',
      category: 'pena',
      spaceType: 'pena',
      capacity: 55,
      reserved: 41,
      distRange: { min: 3.5, max: 5.5 },
    },
  ],

  /* ── Londres ── */
  london: [
    {
      id: 'lon-1',
      matchId: 'match-m-clasico',
      name: 'El Clásico at The Cock & Bull',
      location: 'The Cock & Bull, Shoreditch',
      address: '7 Holywell Lane, EC2A 3ET',
      category: 'classic',
      spaceType: 'bar',
      capacity: 60,
      reserved: 44,
    },
    {
      id: 'lon-2',
      matchId: 'match-m-clasico',
      name: 'Culés in London — Canary Wharf',
      location: 'Piso comunitario, Isle of Dogs',
      address: '14 Westferry Rd, E14 8JH',
      category: 'community',
      spaceType: 'casa',
      capacity: 18,
      reserved: 7,
    },
    {
      id: 'lon-3',
      matchId: 'match-m-clasico',
      name: 'Peña Barcelonista de Londres',
      location: 'Camden Blaugrana Club',
      address: '52 Parkway, NW1 7AH',
      category: 'pena',
      spaceType: 'pena',
      capacity: 85,
      reserved: 68,
    },
  ],

  /* ── Ámsterdam ── */
  amsterdam: [
    {
      id: 'ams-1',
      matchId: 'match-m-clasico',
      name: 'El Clásico at Café de Sport',
      location: 'Café de Sport, Leidseplein',
      address: 'Leidseplein 12, 1017 PT',
      category: 'classic',
      spaceType: 'bar',
      capacity: 45,
      reserved: 31,
    },
    {
      id: 'ams-2',
      matchId: 'match-m-clasico',
      name: 'Barça Dam Crew — Jordaan',
      location: 'Piso comunidad, Jordaan',
      address: 'Elandsgracht 38, 1016 TX',
      category: 'community',
      spaceType: 'casa',
      capacity: 14,
      reserved: 10,
    },
    {
      id: 'ams-3',
      matchId: 'match-m-clasico',
      name: 'Blaugrana Amsterdam — Viewing',
      location: 'Het Sportcafé, De Pijp',
      address: 'Ferdinand Bolstraat 24, 1072 LJ',
      category: 'community',
      spaceType: 'bar',
      capacity: 30,
      reserved: 18,
    },
  ],

  /* ── París ── */
  paris: [
    {
      id: 'par-1',
      matchId: 'match-m-clasico',
      name: 'El Clásico au Frog & Princess',
      location: 'Frog & Princess, Saint-Germain',
      address: '9 Rue Princesse, 75006',
      category: 'classic',
      spaceType: 'bar',
      capacity: 50,
      reserved: 36,
    },
    {
      id: 'par-2',
      matchId: 'match-m-clasico',
      name: 'Culés de Paris — Bastille',
      location: 'Appartement communautaire',
      address: '22 Rue de la Roquette, 75011',
      category: 'community',
      spaceType: 'casa',
      capacity: 20,
      reserved: 14,
    },
    {
      id: 'par-3',
      matchId: 'match-m-clasico',
      name: 'Peña Barcelonista de París',
      location: 'Espace Blaugrana, Marais',
      address: '15 Rue des Archives, 75004',
      category: 'pena',
      spaceType: 'pena',
      capacity: 70,
      reserved: 55,
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
 * Eventos geo usan distRange por plantilla para garantizar distancias escalonadas.
 */
function spawnEventsForScenario(hasGeo, cityKey, center, selectedMatch, filterByMatch = true) {
  if (filterByMatch && selectedMatch && !matchHasEvents(selectedMatch)) {
    return [];
  }

  const key = hasGeo ? 'geo' : cityKey;
  const templates = EVENT_TEMPLATES[key] || [];

  return templates.map((tpl) => {
    const range = hasGeo && tpl.distRange
      ? tpl.distRange
      : { min: 0.8, max: 5.5 };

    const point = randomPointNear(center.lat, center.lng, range.min, range.max);
    const event = {
      ...tpl,
      matchId: selectedMatch?.id || tpl.matchId,
      lat: point.lat,
      lng: point.lng,
    };
    if (hasGeo) {
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
