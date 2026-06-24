/* HdU2 — Partidos de demo (temporada plena Liga + Champions, masculino y femenino) */

const DEMO_TODAY = new Date(2026, 5, 21); // 21 jun 2026

const COMPETITIONS = {
  laliga: { id: 'laliga', label: 'LaLiga', team: 'men' },
  ucl: { id: 'ucl', label: 'Champions League', team: 'men' },
  copa: { id: 'copa', label: 'Copa del Rey', team: 'men' },
  ligaf: { id: 'ligaf', label: 'Liga F', team: 'women' },
  uwcl: { id: 'uwcl', label: 'Champions League', team: 'women' },
  copa_reina: { id: 'copa_reina', label: 'Copa de la Reina', team: 'women' },
};

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * @typedef {'scheduled'|'tbc'|'postponed'|'cancelled'} MatchStatus
 */

const FIXTURES = [
  // —— Masculino · LaLiga ——
  {
    id: 'match-m-0530-betis',
    team: 'men',
    competitionId: 'laliga',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Real Betis',
    awayAbbr: 'BET',
    date: '2026-05-30',
    time: '18:30',
    round: 'Jornada 32',
    status: 'scheduled',
    hasEvents: false,
    eventCount: 0,
    venue: 'Estadi Olímpic Lluís Companys',
  },
  {
    id: 'match-m-0614-athletic',
    team: 'men',
    competitionId: 'laliga',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Athletic Club',
    awayAbbr: 'ATH',
    date: '2026-06-14',
    time: '21:00',
    round: 'Jornada 33',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 2,
    venue: 'Estadi Olímpic Lluís Companys',
  },
  {
    id: 'match-m-clasico',
    team: 'men',
    competitionId: 'laliga',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Real Madrid',
    awayAbbr: 'RMA',
    date: '2026-06-21',
    time: '21:00',
    round: 'Jornada 34',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 6,
    venue: 'Estadi Olímpic Lluís Companys',
  },
  {
    id: 'match-m-0628-sociedad',
    team: 'men',
    competitionId: 'laliga',
    home: 'Real Sociedad',
    homeAbbr: 'RSO',
    away: 'FC Barcelona',
    awayAbbr: 'BAR',
    date: '2026-06-28',
    time: '16:15',
    round: 'Jornada 35',
    status: 'scheduled',
    hasEvents: false,
    eventCount: 0,
    venue: 'Reale Arena',
  },
  {
    id: 'match-m-0705-valencia',
    team: 'men',
    competitionId: 'laliga',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Valencia CF',
    awayAbbr: 'VAL',
    date: '2026-07-05',
    time: null,
    round: 'Jornada 36',
    status: 'tbc',
    hasEvents: false,
    eventCount: 0,
    venue: 'Estadi Olímpic Lluís Companys',
  },
  // —— Masculino · Champions ——
  {
    id: 'match-m-0607-dortmund',
    team: 'men',
    competitionId: 'ucl',
    home: 'Borussia Dortmund',
    homeAbbr: 'BVB',
    away: 'FC Barcelona',
    awayAbbr: 'BAR',
    date: '2026-06-07',
    time: '21:00',
    round: 'Semifinal · Ida',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 3,
    venue: 'Signal Iduna Park',
  },
  {
    id: 'match-m-0618-inter',
    team: 'men',
    competitionId: 'ucl',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Inter',
    awayAbbr: 'INT',
    date: '2026-06-18',
    time: '21:00',
    round: 'Semifinal · Vuelta',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 4,
    venue: 'Estadi Olímpic Lluís Companys',
  },
  {
    id: 'match-m-0706-ucl-final',
    team: 'men',
    competitionId: 'ucl',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Bayern München',
    awayAbbr: 'BAY',
    date: '2026-07-06',
    time: '21:00',
    round: 'Final',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 12,
    venue: 'Allianz Arena',
  },
  // —— Masculino · Copa ——
  {
    id: 'match-m-0710-copa',
    team: 'men',
    competitionId: 'copa',
    home: 'FC Barcelona',
    homeAbbr: 'BAR',
    away: 'Atlético Madrid',
    awayAbbr: 'ATM',
    date: '2026-07-10',
    time: '21:00',
    round: 'Semifinal',
    status: 'postponed',
    hasEvents: false,
    eventCount: 0,
    venue: 'Estadi Olímpic Lluís Companys',
    statusNote: 'Aplazado — nueva fecha por confirmar',
  },
  // —— Femenino · Liga F ——
  {
    id: 'match-w-0615-levante',
    team: 'women',
    competitionId: 'ligaf',
    home: 'FC Barcelona Femení',
    homeAbbr: 'BAR',
    away: 'Levante UD',
    awayAbbr: 'LEV',
    date: '2026-06-15',
    time: '20:00',
    round: 'Jornada 28',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 2,
    venue: 'Johan Cruyff',
  },
  {
    id: 'match-w-0621-madrid',
    team: 'women',
    competitionId: 'ligaf',
    home: 'Real Madrid Femenino',
    homeAbbr: 'RMA',
    away: 'FC Barcelona Femení',
    awayAbbr: 'BAR',
    date: '2026-06-21',
    time: '18:00',
    round: 'Jornada 29',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 5,
    venue: 'Alfredo Di Stéfano',
  },
  {
    id: 'match-w-0629-atletico',
    team: 'women',
    competitionId: 'ligaf',
    home: 'FC Barcelona Femení',
    homeAbbr: 'BAR',
    away: 'Atlético Madrid Femenino',
    awayAbbr: 'ATM',
    date: '2026-06-29',
    time: '20:00',
    round: 'Jornada 30',
    status: 'scheduled',
    hasEvents: false,
    eventCount: 0,
    venue: 'Johan Cruyff',
  },
  {
    id: 'match-w-0707-granadilla',
    team: 'women',
    competitionId: 'ligaf',
    home: 'UDG Tenerife',
    homeAbbr: 'UDG',
    away: 'FC Barcelona Femení',
    awayAbbr: 'BAR',
    date: '2026-07-07',
    time: null,
    round: 'Jornada 31',
    status: 'tbc',
    hasEvents: false,
    eventCount: 0,
    venue: 'La Laguna',
  },
  // —— Femenino · UWCL ——
  {
    id: 'match-w-0610-lyon',
    team: 'women',
    competitionId: 'uwcl',
    home: 'Olympique Lyon Féminin',
    homeAbbr: 'OL',
    away: 'FC Barcelona Femení',
    awayAbbr: 'BAR',
    date: '2026-06-10',
    time: '21:00',
    round: 'Semifinal · Ida',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 3,
    venue: 'Groupama Stadium',
  },
  {
    id: 'match-w-0625-lyon',
    team: 'women',
    competitionId: 'uwcl',
    home: 'FC Barcelona Femení',
    homeAbbr: 'BAR',
    away: 'Olympique Lyon Féminin',
    awayAbbr: 'OL',
    date: '2026-06-25',
    time: '21:00',
    round: 'Semifinal · Vuelta',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 4,
    venue: 'Johan Cruyff',
  },
  {
    id: 'match-w-0708-uwcl-final',
    team: 'women',
    competitionId: 'uwcl',
    home: 'FC Barcelona Femení',
    homeAbbr: 'BAR',
    away: 'Chelsea FC Women',
    awayAbbr: 'CHE',
    date: '2026-07-08',
    time: '21:00',
    round: 'Final',
    status: 'scheduled',
    hasEvents: true,
    eventCount: 8,
    venue: 'San Mamés',
  },
  // —— Femenino · Copa de la Reina ——
  {
    id: 'match-w-0712-copa',
    team: 'women',
    competitionId: 'copa_reina',
    home: 'FC Barcelona Femení',
    homeAbbr: 'BAR',
    away: 'Real Sociedad',
    awayAbbr: 'RSO',
    date: '2026-07-12',
    time: '19:00',
    round: 'Semifinal',
    status: 'cancelled',
    hasEvents: false,
    eventCount: 0,
    venue: 'Johan Cruyff',
    statusNote: 'Cancelado por acuerdo federativo',
  },
];

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatMatchDatetime(match) {
  if (match.status === 'tbc' || !match.time) return 'Por confirmar';
  const d = parseDate(match.date);
  const day = WEEKDAYS_SHORT[d.getDay()];
  const datePart = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${day} ${datePart} · ${match.time}`;
}

function formatDateSeparator(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function matchToSummary(match) {
  return {
    id: match.id,
    home: match.home,
    homeAbbr: match.homeAbbr,
    away: match.away,
    awayAbbr: match.awayAbbr,
    competition: COMPETITIONS[match.competitionId].label,
    competitionId: match.competitionId,
    date: match.date,
    time: match.time,
    datetimeLabel: formatMatchDatetime(match),
    round: match.round,
    team: match.team,
    status: match.status,
    hasEvents: match.hasEvents,
    eventCount: match.eventCount,
    venue: match.venue,
    statusNote: match.statusNote,
  };
}

function getMatchById(id) {
  const m = FIXTURES.find((f) => f.id === id);
  return m ? matchToSummary(m) : null;
}

function getDefaultMatch() {
  return matchToSummary(FIXTURES.find((f) => f.id === 'match-m-clasico'));
}

function filterFixtures({ team = 'men', competitionId = null } = {}) {
  return FIXTURES.filter((f) => {
    if (f.team !== team) return false;
    if (competitionId && f.competitionId !== competitionId) return false;
    return true;
  })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
}

function getUpcomingFixtures(opts) {
  const today = DEMO_TODAY.toISOString().slice(0, 10);
  return filterFixtures(opts).filter(
    (f) => f.date >= today && f.status !== 'cancelled'
  );
}

function getCompetitionsForTeam(team) {
  return Object.values(COMPETITIONS).filter((c) => c.team === team);
}

function matchHasEvents(match) {
  return match.hasEvents && match.eventCount > 0 && match.status !== 'postponed' && match.status !== 'cancelled';
}

function canSearchEvents(match) {
  return matchHasEvents(match);
}

/* ── Escudos de equipos ── */
const _E = 'https://a.espncdn.com/i/teamlogos/soccer/500/';

const TEAM_LOGOS = {
  'FC Barcelona':              _E + '83.png',
  'FC Barcelona Femení':       _E + '83.png',
  'Real Madrid':               _E + '86.png',
  'Real Madrid Femenino':      _E + '86.png',
  'Real Betis':                _E + '90.png',
  'Athletic Club':             _E + '93.png',
  'Valencia CF':               _E + '94.png',
  'Inter':                     _E + '110.png',
  'Olympique Lyon Féminin':    _E + '115.png',
  'Borussia Dortmund':         _E + '124.png',
  'Bayern München':            _E + '132.png',
  'Atlético Madrid':           _E + '1068.png',
  'Atlético Madrid Femenino':  _E + '1068.png',
  'Real Sociedad':             _E + '89.png',
  'Chelsea FC Women':          _E + '363.png',
  'Levante UD':                _E + '747.png',
};

/**
 * Genera el HTML del escudo de un equipo.
 * Si hay logo disponible lo muestra; si falla el fetch, retrocede al badge de texto.
 * @param {string} teamName - nombre completo del equipo
 * @param {string} abbr     - abreviatura de 3 letras
 * @param {'barca'|'rival'} modifier - clase de color
 * @param {string} [extraStyle] - inline style opcional (p.ej. tamaño en el modal)
 */
function crestHtml(teamName, abbr, modifier, extraStyle) {
  const logo = TEAM_LOGOS[teamName];
  const style = extraStyle ? ` style="${extraStyle}"` : '';
  return `<span class="match-card__crest match-card__crest--${modifier}"${style}>${
    logo
      ? `<img src="${logo}" alt="" class="match-card__crest-img" loading="lazy" onerror="this.style.display='none'">`
      : ''
  }${abbr}</span>`;
}
