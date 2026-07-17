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
    {
      id: 'geo-4',
      matchId: 'match-m-clasico',
      name: 'The Corner Pub — a la vuelta',
      location: 'Pub deportivo',
      address: 'A menos de 1 km de ti',
      category: 'classic',
      spaceType: 'bar',
      capacity: 44,
      reserved: 44,
      distRange: { min: 0.5, max: 1.4 },
    },
    {
      id: 'geo-5',
      matchId: 'match-m-clasico',
      name: 'Casa culé — tu vecindario',
      location: 'Piso de un aficionado',
      address: 'A menos de 2 km de ti',
      category: 'community',
      spaceType: 'casa',
      capacity: 16,
      reserved: 6,
      distRange: { min: 1.2, max: 2.6 },
    },
    {
      id: 'geo-6',
      matchId: 'match-m-clasico',
      name: 'Peña Blaugrana — distrito',
      location: 'Local de peña',
      address: 'A menos de 5 km de ti',
      category: 'pena',
      spaceType: 'pena',
      capacity: 70,
      reserved: 33,
      distRange: { min: 2.5, max: 4.5 },
    },
    {
      id: 'geo-7',
      matchId: 'match-m-clasico',
      name: 'Rooftop culé — pantalla gigante',
      location: 'Terraza con pantalla',
      address: 'A menos de 4 km de ti',
      category: 'classic',
      spaceType: 'bar',
      capacity: 90,
      reserved: 78,
      distRange: { min: 2.0, max: 4.0 },
    },
    {
      id: 'geo-8',
      matchId: 'match-m-clasico',
      name: 'Salón blaugrana — recién abierto',
      location: 'Casa de un socio',
      address: 'A menos de 3 km de ti',
      category: 'community',
      spaceType: 'casa',
      capacity: 10,
      reserved: 2,
      distRange: { min: 1.0, max: 2.8 },
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
    {
      id: 'lon-4',
      matchId: 'match-m-clasico',
      name: 'Blaugrana Nights — Soho',
      location: 'The Blue Posts, Soho',
      address: '28 Rupert St, W1D 6DJ',
      category: 'community',
      spaceType: 'bar',
      capacity: 50,
      reserved: 50,
    },
    {
      id: 'lon-5',
      matchId: 'match-m-clasico',
      name: 'Culés SE1 — Living Room',
      location: 'Piso comunitario, Bermondsey',
      address: '5 Tanner St, SE1 3LE',
      category: 'community',
      spaceType: 'casa',
      capacity: 12,
      reserved: 5,
    },
    {
      id: 'lon-6',
      matchId: 'match-m-clasico',
      name: 'Penya Blaugrana Islington',
      location: 'Club social, Islington',
      address: '90 Upper St, N1 0NP',
      category: 'pena',
      spaceType: 'pena',
      capacity: 70,
      reserved: 33,
    },
    {
      id: 'lon-7',
      matchId: 'match-m-clasico',
      name: 'The Culés Tavern — Brixton',
      location: 'Sports pub, Brixton',
      address: '410 Coldharbour Ln, SW9 8LF',
      category: 'classic',
      spaceType: 'bar',
      capacity: 55,
      reserved: 48,
    },
    {
      id: 'lon-8',
      matchId: 'match-m-clasico',
      name: 'Big Screen Clásico — Wembley Box',
      location: 'Sports lounge, Wembley',
      address: '18 Empire Way, HA9 0EW',
      category: 'classic',
      spaceType: 'bar',
      capacity: 120,
      reserved: 61,
    },
    {
      id: 'lon-9',
      matchId: 'match-m-clasico',
      name: 'Casa Laporta — Notting Hill',
      location: 'Casa particular, Notting Hill',
      address: '31 Portobello Rd, W11 3DB',
      category: 'community',
      spaceType: 'casa',
      capacity: 8,
      reserved: 7,
    },
    {
      id: 'lon-10',
      matchId: 'match-m-clasico',
      name: 'Penya Blaugrana Greenwich',
      location: 'Club house, Greenwich',
      address: '2 Nelson Rd, SE10 9JB',
      category: 'pena',
      spaceType: 'pena',
      capacity: 60,
      reserved: 12,
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
    {
      id: 'ams-4',
      matchId: 'match-m-clasico',
      name: 'Més que un Café — Oost',
      location: 'Café Blaugrana, Oost',
      address: 'Javastraat 21, 1094 HB',
      category: 'community',
      spaceType: 'bar',
      capacity: 40,
      reserved: 40,
    },
    {
      id: 'ams-5',
      matchId: 'match-m-clasico',
      name: 'Culés Amsterdam — Living',
      location: 'Piso comunidad, West',
      address: 'Jan Evertsenstraat 88, 1056 EG',
      category: 'community',
      spaceType: 'casa',
      capacity: 16,
      reserved: 6,
    },
    {
      id: 'ams-6',
      matchId: 'match-m-clasico',
      name: 'Penya Blaugrana NL',
      location: 'Sociëteit, Zuid',
      address: 'Beethovenstraat 21, 1077 HM',
      category: 'pena',
      spaceType: 'pena',
      capacity: 75,
      reserved: 52,
    },
    {
      id: 'ams-7',
      matchId: 'match-m-clasico',
      name: 'Clásico aan de gracht',
      location: 'Casa flotante, Prinsengracht',
      address: 'Prinsengracht 263, 1016 GV',
      category: 'community',
      spaceType: 'casa',
      capacity: 9,
      reserved: 3,
    },
    {
      id: 'ams-8',
      matchId: 'match-m-clasico',
      name: 'The Football Factory — Noord',
      location: 'Nave con pantallas, Noord',
      address: 'NDSM-Plein 28, 1033 WB',
      category: 'classic',
      spaceType: 'bar',
      capacity: 110,
      reserved: 96,
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
    {
      id: 'par-4',
      matchId: 'match-m-clasico',
      name: 'Barça Paris — Oberkampf',
      location: 'Le Pub Blaugrana, Oberkampf',
      address: '3 Rue Oberkampf, 75011',
      category: 'classic',
      spaceType: 'bar',
      capacity: 55,
      reserved: 55,
    },
    {
      id: 'par-5',
      matchId: 'match-m-clasico',
      name: 'Culés Paris — Salon',
      location: 'Appartement, Belleville',
      address: '18 Rue de Belleville, 75020',
      category: 'community',
      spaceType: 'casa',
      capacity: 14,
      reserved: 9,
    },
    {
      id: 'par-6',
      matchId: 'match-m-clasico',
      name: 'Penya Blaugrana Montmartre',
      location: 'Espace culé, Montmartre',
      address: '12 Rue des Abbesses, 75018',
      category: 'pena',
      spaceType: 'pena',
      capacity: 65,
      reserved: 40,
    },
    {
      id: 'par-7',
      matchId: 'match-m-clasico',
      name: 'Le Clásico — Canal Saint-Martin',
      location: 'Café-terrasse, Canal Saint-Martin',
      address: '95 Quai de Valmy, 75010',
      category: 'classic',
      spaceType: 'bar',
      capacity: 65,
      reserved: 59,
    },
    {
      id: 'par-8',
      matchId: 'match-m-clasico',
      name: 'Blaugranas du 13e — Chez Marta',
      location: 'Appartement, Butte-aux-Cailles',
      address: '7 Rue des Cinq Diamants, 75013',
      category: 'community',
      spaceType: 'casa',
      capacity: 12,
      reserved: 4,
    },
  ],
};

const FILTER_OPTIONS = {
  spaceType: [
    { id: 'bar', label: 'Bar / local' },
    { id: 'casa', label: 'Casa' },
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
      if (hasGeo && event.distanceKm !== undefined && event.distanceKm > radiusKm) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
}

/* ── Flujo "partido primero" ──
 * Dado un partido, genera los sitios cercanos donde verlo en la ciudad de demo.
 * Reutiliza spawnEventsForScenario + haversine para calcular distancias reales
 * respecto al centro de la ciudad (tratado como "tu zona"). Devuelve la lista
 * ordenada por cercanía. Si el partido no tiene eventos, devuelve [].
 */
/* ── Fotos, valoración y reseñas de local (stock remoto con fallback) ── */
/* Fotos verificadas a mano: bar → interiores de bares/pubs; casa → salones
   (preferiblemente con tele); peña → reuniones de aficionados y amigos.
   Nunca estadios de fútbol. */
const VENUE_PHOTOS = {
  bar: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=640&q=60&auto=format&fit=crop',
  ],
  casa: [
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=640&q=60&auto=format&fit=crop',
  ],
  pena: [
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?w=640&q=60&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=640&q=60&auto=format&fit=crop',
  ],
};

const REVIEW_POOL = [
  { name: 'Marc', initials: 'M', text: 'Ambientazo culé, se vive cada gol como en el Camp Nou.' },
  { name: 'Laura', initials: 'L', text: 'Gente muy maja y buena pantalla. Repetiré seguro.' },
  { name: 'Oty', initials: 'O', text: 'Llegué sin conocer a nadie y acabé celebrando con todos.' },
  { name: 'Jordi', initials: 'J', text: 'Buen sitio, aunque se llena rápido. Reserva con tiempo.' },
  { name: 'Sara', initials: 'S', text: 'El host se curra el ambiente. Cervezas frías y visca Barça.' },
  { name: 'Luis', initials: 'L', text: 'Perfecto para ver el clásico si estás lejos de casa.' },
  { name: 'Nadia', initials: 'N', text: 'Sonido un pelín alto, pero la energía lo compensa.' },
  { name: 'Pau', initials: 'P', text: 'Comunidad auténtica, nada de postureo. 10/10.' },
  { name: 'Íker', initials: 'Í', text: 'Tele grande y cañas a buen precio. Muy recomendable.' },
  { name: 'Carla', initials: 'C', text: 'Fui con mi hermano y encajamos al momento. Volveremos.' },
  { name: 'Dani', initials: 'D', text: 'Un poco justo de sitio en partido grande: llega pronto.' },
  { name: 'Aina', initials: 'A', text: 'Ambiente familiar y muy culé. Perfecto para el clásico.' },
  { name: 'Hugo', initials: 'H', text: 'Pantalla enorme y el gol se celebró como en la grada. Brutal.' },
  { name: 'Mireia', initials: 'M', text: 'Fui sola y me sentí como en casa desde el minuto uno.' },
  { name: 'Tomás', initials: 'T', text: 'Buen rollo, aunque el descanso se hizo largo por la cola del bar.' },
  { name: 'Anna', initials: 'A', text: 'El host preparó hasta pan con tomate. Detallazo.' },
  { name: 'Karim', initials: 'K', text: 'Llevé a un amigo madridista y salió medio culé. Ambientazo.' },
  { name: 'Julia', initials: 'J', text: 'Un poco difícil de encontrar la entrada, pero mereció la pena.' },
  { name: 'Pere', initials: 'P', text: 'Se canta el himno antes del partido. Piel de gallina.' },
  { name: 'Sofía', initials: 'S', text: 'Sitio correcto sin más, aunque la compañía lo arregla todo.' },
];

const REVIEW_DATES = ['hace 2 días', 'hace 3 días', 'hace 5 días', 'hace 1 semana', 'hace 2 semanas', 'hace 3 semanas', 'hace 1 mes', 'hace 2 meses'];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/* Asigna foto/valoración/reseñas de forma estable a partir del id del sitio */
function enrichVenue(v) {
  const h = hashStr(v.id);
  const photos = VENUE_PHOTOS[v.spaceType] || VENUE_PHOTOS.bar;
  const image = photos[h % photos.length];
  const rating = Math.round((3.9 + (h % 12) / 10) * 10) / 10; // 3.9 – 5.0
  const reviewCount = 18 + (h % 230);
  const shownReviews = 2 + (h % 3); // 2–4 reseñas visibles según el sitio
  const reviews = Array.from({ length: shownReviews }, (_, i) => i).map((i) => {
    const p = REVIEW_POOL[(h + i * 3) % REVIEW_POOL.length];
    const r = Math.max(3, Math.min(5, Math.round(rating) - (i === 2 ? 1 : 0)));
    return { name: p.name, initials: p.initials, text: p.text, rating: r, date: REVIEW_DATES[(h + i) % REVIEW_DATES.length] };
  });
  return { ...v, image, rating, reviewCount, reviews };
}

/**
 * Genera los sitios cercanos donde ver un partido según el contexto de búsqueda.
 * @param {object} match     - partido seleccionado (summary)
 * @param {object} [search]  - { hasGeo, cityKey, center } (por defecto Londres)
 */
function buildVenuesForMatch(match, search) {
  const hasGeo = !!(search && search.hasGeo);
  const cityKey = (search && search.cityKey) || 'london';
  let center = search && search.center;
  if (!center) {
    const c = CITIES[cityKey] || CITIES.london;
    center = { lat: c.lat, lng: c.lng };
  }
  const venues = spawnEventsForScenario(hasGeo, cityKey, center, match, true);
  return venues
    .map((v) => enrichVenue({
      ...v,
      distanceKm:
        v.distanceKm !== undefined
          ? v.distanceKm
          : haversineKm(center.lat, center.lng, v.lat, v.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

const SPACE_TYPE_LABELS = {
  bar: 'Bar / local',
  casa: 'Casa',
  pena: 'Peña',
};

const VENUE_SORTS = {
  distance: 'Cercanía',
  rating: 'Valoración',
  availability: 'Plazas libres',
};

/* Filtra la lista de sitios de un partido según los criterios de la toolbar */
function filterVenues(venues, { spaceType = [], hideFull = false, minRating = 0 } = {}) {
  return venues.filter((v) => {
    if (spaceType.length && !spaceType.includes(v.spaceType)) return false;
    if (hideFull && v.reserved >= v.capacity) return false;
    if (minRating && (v.rating || 0) < minRating) return false;
    return true;
  });
}

/* Ordena la lista de sitios; la cercanía es el desempate por defecto */
function sortVenues(venues, sortBy = 'distance') {
  const arr = [...venues];
  if (sortBy === 'rating') {
    arr.sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.distanceKm - b.distanceKm);
  } else if (sortBy === 'availability') {
    arr.sort((a, b) => (b.capacity - b.reserved) - (a.capacity - a.reserved) || a.distanceKm - b.distanceKm);
  } else {
    arr.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  return arr;
}

/* ── Tickets / entradas ── */
let _ticketSeq = 0;

function generateTicketCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = String(10 + Math.floor(Math.random() * 89)); // 2 dígitos
  _ticketSeq += 1;
  return `${letter}${num}`;
}
