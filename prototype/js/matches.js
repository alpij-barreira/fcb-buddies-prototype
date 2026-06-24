/* HdU2 — Explorar partidos */

const Matches = {
  state: {
    team: 'men',
    competitionFilter: null,
    tab: 'upcoming',
    calendarMonth: new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1),
    selectedDay: null,
    selectedCompetitionTab: null,
    modalMatch: null,
    eventsLoadError: false,
    calendarLoadError: false,
  },

  els: {},

  init() {
    this.cacheElements();
    this.bindEvents();
    this.renderTeamToggle();
    this.renderCompetitionFilters();
    this.renderTabs();
    this.render();
  },

  cacheElements() {
    const ids = [
      'screen-matches',
      'matches-team-toggle',
      'matches-competition-filters',
      'matches-tabs',
      'matches-tab-upcoming',
      'matches-tab-competition',
      'matches-tab-calendar',
      'matches-content',
      'match-modal-overlay',
      'match-modal',
      'match-modal-content',
    ];
    ids.forEach((id) => {
      this.els[id] = document.getElementById(id);
    });
  },

  bindEvents() {
    this.els['match-modal-overlay']?.addEventListener('click', () => this.closeModal());

    // Acciones del modal — está fuera de matches-content, requiere listener propio
    this.els['match-modal']?.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-action="close"]')) { this.closeModal(); return; }
      if (e.target.closest('[data-modal-action="search"]')) { this.searchEventsWithMatch(); return; }
      if (e.target.closest('[data-modal-action="explore-nearby"]')) { this.exploreNearby(); return; }
      if (e.target.closest('[data-modal-action="retry-events"]')) {
        this.state.eventsLoadError = false;
        this.renderModal();
        return;
      }
    });

    this.els['matches-tabs']?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-matches-tab]');
      if (!btn) return;
      this.state.tab = btn.dataset.matchesTab;
      this.renderTabs();
      this.render();
    });

    this.els['matches-team-toggle']?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-team]');
      if (!btn) return;
      this.state.team = btn.dataset.team;
      this.state.competitionFilter = null;
      this.state.selectedCompetitionTab = null;
      this.state.selectedDay = null;
      this.renderTeamToggle();
      this.renderCompetitionFilters();
      this.render();
    });

    this.els['matches-competition-filters']?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-competition]');
      if (!chip) return;
      const id = chip.dataset.competition || null;
      this.state.competitionFilter = this.state.competitionFilter === id ? null : id;
      this.renderCompetitionFilters();
      this.render();
    });

    this.els['matches-content']?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-match-id]');
      if (card) {
        this.openModal(card.dataset.matchId);
        return;
      }
      const dayBtn = e.target.closest('[data-cal-day]');
      if (dayBtn) {
        this.state.selectedDay = dayBtn.dataset.calDay;
        this.render();
        return;
      }
      const navBtn = e.target.closest('[data-cal-nav]');
      if (navBtn) {
        const dir = Number(navBtn.dataset.calNav);
        const m = this.state.calendarMonth;
        this.state.calendarMonth = new Date(m.getFullYear(), m.getMonth() + dir, 1);
        this.state.selectedDay = null;
        this.render();
        return;
      }
      const compBtn = e.target.closest('[data-comp-tab]');
      if (compBtn) {
        this.state.selectedCompetitionTab = compBtn.dataset.compTab;
        this.render();
        return;
      }
      if (e.target.closest('#matches-retry-calendar')) {
        this.state.calendarLoadError = false;
        this.render();
      }
      if (e.target.closest('#match-modal-clear-comp-filter')) {
        this.state.competitionFilter = null;
        this.state.selectedCompetitionTab = null;
        this.renderCompetitionFilters();
        this.closeModal();
        this.state.tab = 'competition';
        this.renderTabs();
        this.render();
      }
    });
  },

  show() {
    if (App.state.selectedMatch?.team) {
      this.state.team = App.state.selectedMatch.team === 'women' ? 'women' : 'men';
    }
    this.state.calendarMonth = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1);
    this.renderTeamToggle();
    this.renderCompetitionFilters();
    this.renderTabs();
    this.render();
  },

  renderTeamToggle() {
    const el = this.els['matches-team-toggle'];
    if (!el) return;
    const label = this.state.team === 'men' ? 'Primer equipo' : 'FC Barcelona Femení';
    el.innerHTML = `
      <span class="matches-team-toggle__label">${label}</span>
      <div class="segmented-control" role="group" aria-label="Equipo">
        <button type="button" class="segmented-control__btn${this.state.team === 'men' ? ' is-active' : ''}" data-team="men">Masculino</button>
        <button type="button" class="segmented-control__btn${this.state.team === 'women' ? ' is-active' : ''}" data-team="women">Femenino</button>
      </div>
    `;
  },

  renderCompetitionFilters() {
    const el = this.els['matches-competition-filters'];
    if (!el) return;
    const comps = getCompetitionsForTeam(this.state.team);
    el.innerHTML = `
      <button type="button" class="filter-chip${!this.state.competitionFilter ? ' is-active' : ''}" data-competition="">Todas</button>
      ${comps.map((c) => `
        <button type="button" class="filter-chip${this.state.competitionFilter === c.id ? ' is-active' : ''}" data-competition="${c.id}">${c.label}</button>
      `).join('')}
    `;
  },

  renderTabs() {
    const el = this.els['matches-tabs'];
    if (!el) return;
    const tabs = [
      { id: 'upcoming', label: 'Próximos' },
      { id: 'competition', label: 'Competición' },
      { id: 'calendar', label: 'Calendario' },
    ];
    el.innerHTML = tabs
      .map(
        (t) => `
      <button type="button" class="tab-btn${this.state.tab === t.id ? ' is-active' : ''}" data-matches-tab="${t.id}" role="tab" aria-selected="${this.state.tab === t.id}">
        ${t.label}
      </button>
    `
      )
      .join('');
  },

  render() {
    const content = this.els['matches-content'];
    if (!content) return;

    if (this.state.calendarLoadError && this.state.tab === 'calendar') {
      content.innerHTML = this.renderCalendarError();
      return;
    }

    switch (this.state.tab) {
      case 'upcoming':
        content.innerHTML = this.renderUpcoming();
        break;
      case 'competition':
        content.innerHTML = this.renderCompetitionTab();
        break;
      case 'calendar':
        content.innerHTML = this.renderCalendarTab();
        break;
    }
  },

  getFilteredFixtures() {
    return filterFixtures({
      team: this.state.team,
      competitionId: this.state.competitionFilter,
    });
  },

  renderMatchCard(match) {
    const eventsBadge = matchHasEvents(match)
      ? `<span class="match-fixture-card__events match-fixture-card__events--yes">${match.eventCount} evento${match.eventCount !== 1 ? 's' : ''}</span>`
      : `<span class="match-fixture-card__events">Sin eventos</span>`;

    const statusHtml =
      match.status === 'postponed'
        ? `<span class="match-fixture-card__status match-fixture-card__status--warn">Aplazado</span>`
        : match.status === 'cancelled'
          ? `<span class="match-fixture-card__status match-fixture-card__status--danger">Cancelado</span>`
          : match.status === 'tbc'
            ? `<span class="match-fixture-card__status">Hora por confirmar</span>`
            : '';

    const timeLabel =
      match.status === 'tbc' || !match.time ? 'Por confirmar' : match.time;

    return `
      <article class="match-fixture-card" data-match-id="${match.id}" role="button" tabindex="0">
        <div class="match-fixture-card__header">
          <span class="overline">${COMPETITIONS[match.competitionId].label}</span>
          ${eventsBadge}
        </div>
        <div class="match-fixture-card__teams">
          <div class="match-fixture-card__team">
            ${crestHtml(match.home, match.homeAbbr, 'barca')}
            <span class="body-s">${match.home}</span>
          </div>
          <span class="match-fixture-card__vs">vs</span>
          <div class="match-fixture-card__team">
            ${crestHtml(match.away, match.awayAbbr, 'rival')}
            <span class="body-s">${match.away}</span>
          </div>
        </div>
        <div class="match-fixture-card__meta">
          <span class="caption">${match.round}</span>
          <span class="caption">${timeLabel}</span>
        </div>
        ${statusHtml}
      </article>
    `;
  },

  renderUpcoming() {
    const fixtures = getUpcomingFixtures({
      team: this.state.team,
      competitionId: this.state.competitionFilter,
    });

    if (!fixtures.length) {
      return `
        <div class="matches-empty">
          <h2 class="heading-s">No hay partidos próximos</h2>
          <p class="body-s">Prueba con otro filtro de competición o cambia de equipo.</p>
          ${this.state.competitionFilter ? '<button type="button" class="btn btn--secondary btn--block" id="match-modal-clear-comp-filter">Quitar filtro de competición</button>' : ''}
        </div>
      `;
    }

    let lastDate = '';
    let html = '<div class="matches-list">';
    fixtures.forEach((match) => {
      if (match.date !== lastDate) {
        lastDate = match.date;
        html += `<h2 class="matches-date-separator">${formatDateSeparator(match.date)}</h2>`;
      }
      html += this.renderMatchCard(match);
    });
    html += '</div>';
    return html;
  },

  renderCompetitionTab() {
    const comps = getCompetitionsForTeam(this.state.team);
    const selected = this.state.selectedCompetitionTab || comps[0]?.id;

    const fixtures = filterFixtures({
      team: this.state.team,
      competitionId: selected,
    });

    return `
      <div class="matches-competition-picker">
        ${comps.map((c) => `
          <button type="button" class="filter-chip${selected === c.id ? ' is-active' : ''}" data-comp-tab="${c.id}">${c.label}</button>
        `).join('')}
      </div>
      ${fixtures.length ? `
        <div class="matches-list">
          ${fixtures.map((m) => this.renderMatchCard(m)).join('')}
        </div>
      ` : `
        <div class="matches-empty">
          <h2 class="heading-s">Sin partidos en esta competición</h2>
          <p class="body-s">No hay partidos programados para ${COMPETITIONS[selected].label} del ${this.state.team === 'men' ? 'primer equipo' : 'equipo femenino'}.</p>
          <button type="button" class="btn btn--secondary btn--block" data-comp-tab="${comps[0]?.id || ''}">Ver otra competición</button>
        </div>
      `}
    `;
  },

  renderCalendarTab() {
    const year = this.state.calendarMonth.getFullYear();
    const month = this.state.calendarMonth.getMonth();
    const monthLabel = `${MONTHS_ES[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const startPad = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const fixtures = this.getFilteredFixtures();
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

    return `
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
          <h2 class="matches-date-separator">${formatDateSeparator(this.state.selectedDay)}</h2>
          ${dayFixtures.length
            ? dayFixtures.map((m) => this.renderMatchCard(m)).join('')
            : '<p class="body-s" style="color: var(--content-secondary); padding: var(--space-4) 0">No hay partidos este día.</p>'}
        </div>
      ` : '<p class="caption calendar__hint">Selecciona un día con partido</p>'}
    `;
  },

  renderCalendarError() {
    return `
      <div class="matches-empty">
        <h2 class="heading-s">No se pudo cargar el calendario</h2>
        <p class="body-s">Comprueba tu conexión e inténtalo de nuevo.</p>
        <button type="button" class="btn btn--secondary btn--block" id="matches-retry-calendar">Reintentar</button>
      </div>
    `;
  },

  openModal(matchId) {
    const raw = FIXTURES.find((f) => f.id === matchId);
    if (!raw) return;
    this.state.modalMatch = raw;
    this.state.eventsLoadError = false;
    this.els['match-modal-overlay'].classList.add('is-open');
    this.els['match-modal'].classList.add('is-open');
    this.renderModal();
  },

  closeModal() {
    this.state.modalMatch = null;
    this.els['match-modal-overlay'].classList.remove('is-open');
    this.els['match-modal'].classList.remove('is-open');
  },

  renderModal() {
    const match = this.state.modalMatch;
    const content = this.els['match-modal-content'];
    if (!match || !content) return;

    const comp = COMPETITIONS[match.competitionId].label;
    const teamLabel = match.team === 'men' ? 'Primer equipo' : 'FC Barcelona Femení';
    const datetime = formatMatchDatetime(match);

    let statusBlock = '';
    if (match.status === 'postponed') {
      statusBlock = `<p class="alert alert--info">${match.statusNote || 'Partido aplazado'}</p>`;
    } else if (match.status === 'cancelled') {
      statusBlock = `<p class="alert alert--info" style="border-color: var(--grana-200); background: var(--grana-50); color: var(--grana-700)">${match.statusNote || 'Partido cancelado'}</p>`;
    }

    let eventsBlock = '';
    if (this.state.eventsLoadError) {
      eventsBlock = `
        <div class="matches-empty" style="padding: var(--space-4) 0">
          <p class="body-s">No pudimos cargar los eventos asociados.</p>
          <button type="button" class="btn btn--ghost btn--block" data-modal-action="retry-events">Reintentar</button>
        </div>
      `;
    } else if (matchHasEvents(match)) {
      eventsBlock = `
        <p class="body-m" style="margin-bottom: var(--space-4)">
          <strong>${match.eventCount}</strong> evento${match.eventCount !== 1 ? 's' : ''} disponible${match.eventCount !== 1 ? 's' : ''} para ver este partido en compañía.
        </p>
        <button type="button" class="btn btn--primary btn--block" data-modal-action="search">Buscar eventos con este partido</button>
      `;
    } else {
      eventsBlock = `
        <p class="body-m" style="color: var(--content-secondary); margin-bottom: var(--space-4)">
          Todavía no hay eventos de la comunidad para este partido.
        </p>
        <button type="button" class="btn btn--secondary btn--block" data-modal-action="explore-nearby">Buscar eventos cercanos</button>
        <button type="button" class="btn btn--ghost btn--block" data-modal-action="close" style="margin-top: var(--space-3)">Seguir explorando partidos</button>
      `;
    }

    const actionsBlock =
      match.status === 'postponed' || match.status === 'cancelled'
        ? `<button type="button" class="btn btn--ghost btn--block" data-modal-action="close">Cerrar</button>`
        : eventsBlock;

    content.innerHTML = `
      <div class="match-modal__header">
        <span class="overline">${comp} · ${teamLabel}</span>
        <button type="button" class="event-panel__close" data-modal-action="close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="match-modal__teams">
        <div class="match-modal__team">
          ${crestHtml(match.home, match.homeAbbr, 'barca', 'width:40px;height:40px;font-size:12px')}
          <span class="heading-s">${match.home}</span>
        </div>
        <span class="match-fixture-card__vs">vs</span>
        <div class="match-modal__team">
          ${crestHtml(match.away, match.awayAbbr, 'rival', 'width:40px;height:40px;font-size:12px')}
          <span class="heading-s">${match.away}</span>
        </div>
      </div>
      <dl class="match-modal__details">
        <div><dt>Fecha y hora</dt><dd>${datetime}</dd></div>
        <div><dt>${match.round.includes('Jornada') ? 'Jornada' : 'Fase'}</dt><dd>${match.round}</dd></div>
        <div><dt>Estadio</dt><dd>${match.venue}</dd></div>
      </dl>
      ${statusBlock}
      <div class="match-modal__actions">${actionsBlock}</div>
    `;
  },

  searchEventsWithMatch() {
    const summary = matchToSummary(this.state.modalMatch);
    App.applySelectedMatch(summary, { filterByMatch: true });
    this.closeModal();
    App.showMainTab('discover');
  },

  exploreNearby() {
    App.applySelectedMatch(App.state.selectedMatch, { filterByMatch: false });
    this.closeModal();
    App.showMainTab('discover');
  },
};
