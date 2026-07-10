/* Home — El partido es el protagonista (feed + filtros integrados + calendario) */

const Home = {
  state: {
    team: 'men',
    competition: null,       // null = todas las competiciones
    filterDraft: null,       // borrador del sheet de filtro
    calendarMonth: new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1),
    selectedDay: null,
  },

  els: {},

  init() {
    this.cacheElements();
    this.bindEvents();
    this.render();
    this.updateFilterLabel();
  },

  cacheElements() {
    [
      'home-content', 'home-filter-btn', 'home-filter-label', 'home-calendar-btn',
      'home-filter-overlay', 'home-filter-sheet', 'home-filter-content',
      'calendar-overlay', 'calendar-sheet', 'calendar-content',
    ].forEach((id) => { this.els[id] = document.getElementById(id); });
  },

  bindEvents() {
    this.els['home-filter-btn']?.addEventListener('click', () => this.openFilters());
    this.els['home-calendar-btn']?.addEventListener('click', () => this.openCalendar());

    this.els['home-filter-overlay']?.addEventListener('click', () => this.closeFilters());
    this.els['home-filter-content']?.addEventListener('click', (e) => this.handleFilterClick(e));

    this.els['calendar-overlay']?.addEventListener('click', () => this.closeCalendar());
    this.els['calendar-content']?.addEventListener('click', (e) => this.handleCalendarClick(e));

    this.els['home-content']?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-match-id]');
      if (card) { App.openMatchDetail(card.dataset.matchId); return; }
      if (e.target.closest('[data-clear-home-filter]')) {
        this.state.competition = null;
        this.render();
        this.updateFilterLabel();
      }
    });
  },

  show() {
    this.render();
    this.updateFilterLabel();
  },

  scrollTop() {
    if (this.els['home-content']) this.els['home-content'].scrollTop = 0;
  },

  /* ============================ Feed ============================ */

  getFixtures() {
    let fx = getUpcomingFixtures({ team: this.state.team });
    if (this.state.competition) fx = fx.filter((f) => f.competitionId === this.state.competition);
    return fx;
  },

  socialProof(match) {
    if (!matchHasEvents(match)) {
      return `<span class="match-feed-card__social">Aún sin sitios</span>`;
    }
    return `
      <span class="match-feed-card__social match-feed-card__social--yes">
        <span class="match-feed-card__dot" aria-hidden="true"></span>
        ${match.eventCount} sitio${match.eventCount !== 1 ? 's' : ''} cerca
      </span>
    `;
  },

  renderHero(match) {
    const comp = COMPETITIONS[match.competitionId].label;
    const teamTag = match.team === 'women' ? 'Femení' : 'Masculino';
    const datetime = formatMatchDatetime(match);
    return `
      <button type="button" class="home-hero" data-match-id="${match.id}">
        <span class="home-hero__flag">Partido destacado</span>
        <div class="home-hero__teams">
          ${crestHtml(match.home, match.homeAbbr, 'barca', 'width:56px;height:56px;font-size:14px')}
          <span class="home-hero__vs">VS</span>
          ${crestHtml(match.away, match.awayAbbr, 'rival', 'width:56px;height:56px;font-size:14px')}
        </div>
        <div class="home-hero__names">
          <span>${match.home}</span>
          <span class="home-hero__vs-mini">·</span>
          <span>${match.away}</span>
        </div>
        <div class="home-hero__comp">${comp} · ${teamTag}</div>
        <div class="home-hero__datetime">${datetime}</div>
        <div class="home-hero__footer">
          ${this.socialProof(match)}
          <span class="home-hero__cta">Dónde verlo</span>
        </div>
      </button>
    `;
  },

  renderFeedCard(match) {
    const comp = COMPETITIONS[match.competitionId].label;
    const timeLabel =
      match.status === 'tbc' || !match.time ? 'Hora por confirmar' : formatMatchDatetime(match);

    const statusHtml =
      match.status === 'postponed'
        ? `<span class="match-fixture-card__status match-fixture-card__status--warn">Aplazado</span>`
        : match.status === 'cancelled'
          ? `<span class="match-fixture-card__status match-fixture-card__status--danger">Cancelado</span>`
          : '';

    return `
      <article class="match-feed-card" data-match-id="${match.id}" role="button" tabindex="0">
        <div class="match-feed-card__top">
          <span class="overline">${comp}</span>
          ${this.socialProof(match)}
        </div>
        <div class="match-feed-card__teams">
          <div class="mfc-team">
            ${crestHtml(match.home, match.homeAbbr, 'barca', 'width:40px;height:40px;font-size:12px')}
            <span class="mfc-team__name">${match.home}</span>
          </div>
          <span class="match-feed-card__vs">VS</span>
          <div class="mfc-team">
            ${crestHtml(match.away, match.awayAbbr, 'rival', 'width:40px;height:40px;font-size:12px')}
            <span class="mfc-team__name">${match.away}</span>
          </div>
        </div>
        <div class="match-feed-card__bottom">
          <span class="match-feed-card__datetime">${timeLabel}</span>
          <span class="match-feed-card__go">Dónde verlo ›</span>
        </div>
        ${statusHtml}
      </article>
    `;
  },

  pickFeatured(fixtures) {
    const withEvents = fixtures.filter((f) => matchHasEvents(f));
    if (!withEvents.length) return null;
    return withEvents.reduce((best, f) => (f.eventCount > best.eventCount ? f : best), withEvents[0]);
  },

  render() {
    const content = this.els['home-content'];
    if (!content) return;

    const fixtures = this.getFixtures();

    if (!fixtures.length) {
      content.innerHTML = `
        <div class="matches-empty">
          <h2 class="heading-s">No hay partidos con este filtro</h2>
          <p class="body-s">Prueba con otra competición o revisa el calendario completo.</p>
          ${this.state.competition ? '<button type="button" class="btn btn--secondary" data-clear-home-filter style="margin-top:var(--space-3)">Quitar filtro de competición</button>' : ''}
        </div>
      `;
      return;
    }

    const featured = this.pickFeatured(fixtures);
    const rest = featured ? fixtures.filter((f) => f.id !== featured.id) : fixtures;

    let html = featured ? this.renderHero(featured) : '';
    html += '<h2 class="home-section-title">Próximos partidos</h2>';

    let lastDate = '';
    html += '<div class="matches-list">';
    rest.forEach((match) => {
      if (match.date !== lastDate) {
        lastDate = match.date;
        html += `<h3 class="matches-date-separator">${formatDateSeparator(match.date)}</h3>`;
      }
      html += this.renderFeedCard(match);
    });
    html += '</div>';
    content.innerHTML = html;
  },

  updateFilterLabel() {
    const el = this.els['home-filter-label'];
    if (!el) return;
    const teamLbl = this.state.team === 'men' ? 'Masculino' : 'Femenino';
    const compLbl = this.state.competition ? COMPETITIONS[this.state.competition].label : 'Todas';
    el.textContent = `${teamLbl} · ${compLbl}`;
  },

  /* ============================ Sheet de filtro (equipo + competición) ============================ */

  openFilters() {
    this.state.filterDraft = { team: this.state.team, competition: this.state.competition };
    this.renderFilters();
    this.els['home-filter-overlay'].classList.add('is-open');
    this.els['home-filter-sheet'].classList.add('is-open');
  },

  closeFilters() {
    this.els['home-filter-overlay'].classList.remove('is-open');
    this.els['home-filter-sheet'].classList.remove('is-open');
  },

  renderFilters() {
    const d = this.state.filterDraft;
    const comps = getCompetitionsForTeam(d.team);
    this.els['home-filter-content'].innerHTML = `
      <div class="filter-sheet__header">
        <h2 class="filter-sheet__title" id="home-filter-title">Filtrar partidos</h2>
        <button type="button" class="filter-sheet__clear" data-filter-action="clear">Limpiar</button>
      </div>

      <div class="filter-group">
        <h3 class="filter-group__title">Equipo</h3>
        <div class="segmented-control" role="group" aria-label="Equipo">
          <button type="button" class="segmented-control__btn${d.team === 'men' ? ' is-active' : ''}" data-team="men">Masculino</button>
          <button type="button" class="segmented-control__btn${d.team === 'women' ? ' is-active' : ''}" data-team="women">Femenino</button>
        </div>
      </div>

      <div class="filter-group">
        <h3 class="filter-group__title">Competición</h3>
        <div class="filter-chips">
          <button type="button" class="filter-chip${!d.competition ? ' is-active' : ''}" data-comp="">Todas</button>
          ${comps.map((c) => `
            <button type="button" class="filter-chip${d.competition === c.id ? ' is-active' : ''}" data-comp="${c.id}">${c.label}</button>
          `).join('')}
        </div>
      </div>

      <div class="filter-sheet__footer">
        <button type="button" class="btn btn--primary btn--block" data-filter-action="apply">Ver partidos</button>
        <button type="button" class="btn btn--ghost btn--block" data-filter-action="close" style="margin-top: var(--space-3)">Cerrar</button>
      </div>
    `;
  },

  handleFilterClick(e) {
    const d = this.state.filterDraft;
    if (!d) return;
    const action = e.target.closest('[data-filter-action]')?.dataset.filterAction;
    if (action === 'close') { this.closeFilters(); return; }
    if (action === 'clear') {
      d.competition = null;
      this.renderFilters();
      return;
    }
    if (action === 'apply') {
      this.state.team = d.team;
      this.state.competition = d.competition;
      this.closeFilters();
      this.render();
      this.updateFilterLabel();
      this.scrollTop();
      return;
    }

    const team = e.target.closest('[data-team]')?.dataset.team;
    if (team) {
      d.team = team;
      d.competition = null; // las competiciones dependen del equipo
      this.renderFilters();
      return;
    }

    const comp = e.target.closest('[data-comp]');
    if (comp) {
      d.competition = comp.dataset.comp || null;
      this.renderFilters();
    }
  },

  /* ============================ Calendario (overlay) ============================ */

  openCalendar() {
    this.state.calendarMonth = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1);
    this.state.selectedDay = null;
    this.renderCalendar();
    this.els['calendar-overlay'].classList.add('is-open');
    this.els['calendar-sheet'].classList.add('is-open');
  },

  closeCalendar() {
    this.els['calendar-overlay'].classList.remove('is-open');
    this.els['calendar-sheet'].classList.remove('is-open');
  },

  handleCalendarClick(e) {
    if (e.target.closest('[data-calendar-close]')) { this.closeCalendar(); return; }

    const card = e.target.closest('[data-match-id]');
    if (card) { this.closeCalendar(); App.openMatchDetail(card.dataset.matchId); return; }

    const dayBtn = e.target.closest('[data-cal-day]');
    if (dayBtn) { this.state.selectedDay = dayBtn.dataset.calDay; this.renderCalendar(); return; }

    const navBtn = e.target.closest('[data-cal-nav]');
    if (navBtn) {
      const dir = Number(navBtn.dataset.calNav);
      const m = this.state.calendarMonth;
      this.state.calendarMonth = new Date(m.getFullYear(), m.getMonth() + dir, 1);
      this.state.selectedDay = null;
      this.renderCalendar();
    }
  },

  renderCalendar() {
    const year = this.state.calendarMonth.getFullYear();
    const month = this.state.calendarMonth.getMonth();
    const monthLabel = `${MONTHS_ES[month]} ${year}`;
    const teamLbl = this.state.team === 'men' ? 'primer equipo' : 'equipo femenino';

    const firstDay = new Date(year, month, 1);
    const startPad = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // El calendario da visión global: todos los partidos del equipo seleccionado
    const fixtures = filterFixtures({ team: this.state.team });
    const matchDays = new Set(fixtures.map((f) => f.date));

    let cells = '';
    for (let i = 0; i < startPad; i++) {
      cells += '<span class="calendar__day calendar__day--empty"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasMatch = matchDays.has(dateStr);
      const isToday = dateStr === DEMO_TODAY.toISOString().slice(0, 10);
      const isSelected = this.state.selectedDay === dateStr;
      cells += `
        <button type="button" class="calendar__day${hasMatch ? ' calendar__day--has-match' : ''}${isToday ? ' calendar__day--today' : ''}${isSelected ? ' is-selected' : ''}"
          data-cal-day="${dateStr}" ${hasMatch ? '' : 'disabled'}>
          <span>${d}</span>
          ${hasMatch ? '<span class="calendar__dot"></span>' : ''}
        </button>
      `;
    }

    const dayFixtures = this.state.selectedDay
      ? fixtures.filter((f) => f.date === this.state.selectedDay)
      : [];

    this.els['calendar-content'].innerHTML = `
      <div class="filter-sheet__header">
        <h2 class="filter-sheet__title" id="calendar-title">Calendario · ${teamLbl}</h2>
        <button type="button" class="access-sheet__close" data-calendar-close aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="calendar">
        <div class="calendar__nav">
          <button type="button" class="icon-btn" data-cal-nav="-1" aria-label="Mes anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span class="heading-s">${monthLabel}</span>
          <button type="button" class="icon-btn" data-cal-nav="1" aria-label="Mes siguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="calendar__weekdays">
          <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
        </div>
        <div class="calendar__grid">${cells}</div>
      </div>
      ${this.state.selectedDay ? `
        <div class="calendar__day-matches">
          <h3 class="matches-date-separator">${formatDateSeparator(this.state.selectedDay)}</h3>
          ${dayFixtures.length
            ? dayFixtures.map((m) => this.renderFeedCard(m)).join('')
            : '<p class="body-s" style="color: var(--content-secondary); padding: var(--space-4) 0">No hay partidos este día.</p>'}
        </div>
      ` : '<p class="caption calendar__hint">Selecciona un día con partido para ver los detalles</p>'}
    `;
  },
};
