/* HdU1 — Descubrir eventos */

const App = {
  state: {
    screen: 'geo-prompt',
    city: null,
    userLocation: null,
    hasGeo: false,
    viewMode: 'map',
    radiusKm: 5,
    selectedMatch: getDefaultMatch(),
    mainTab: 'discover',
    selectedEvent: null,
    panelOpen: false,
    filtersOpen: false,
    filters: { spaceType: [], category: [] },
    loading: false,
    emptyState: null,
    searchQuery: '',
    searchError: null,
    cityKey: 'london',
    placedEvents: [],
    scenarioId: null,
    filterEventsByMatch: true,
    authModalOpen: false,
    authStep: 'entry',
    authUser: null,
    reservationIntent: null,
    accessSubmitting: false,
    accessTechnicalError: false,
    accessMessage: null,
    existingUsers: [
      {
        firstName: 'Javier',
        lastName: 'Culé',
        email: 'javier@buddies.demo',
        password: 'ForcaBarca123',
        city: 'Londres',
        area: 'Camden',
      },
    ],
  },

  els: {},

  init() {
    this.cacheElements();
    this.bindEvents();
    this.showScreen('geo-prompt');
  },

  cacheElements() {
    const ids = [
      'screen-geo-prompt', 'screen-manual-location', 'screen-geo-error',
      'screen-loading', 'screen-discover',
      'btn-geo-yes', 'btn-geo-no', 'btn-manual-submit', 'manual-city-input',
      'manual-city-error', 'btn-geo-retry', 'btn-geo-search',
      'loading-message', 'search-input', 'search-error',
      'match-card', 'radius-slider', 'radius-value',
      'btn-filters', 'filter-badge', 'btn-view-map', 'btn-view-list',
      'map-area', 'map-container', 'list-container', 'event-list',
      'event-panel', 'panel-content', 'radius-control',
      'empty-state', 'empty-title', 'empty-text', 'empty-actions',
      'btn-geo-toggle',
      'geo-modal-overlay', 'geo-modal', 'geo-modal-title', 'geo-modal-text',
      'geo-modal-confirm', 'geo-modal-cancel',
      'filter-overlay', 'filter-sheet', 'filter-close', 'filter-apply',
      'filter-clear', 'filter-space-types', 'filter-categories',
      'bottom-nav', 'screen-matches',
      'access-overlay', 'access-sheet', 'access-content',
    ];
    ids.forEach((id) => {
      this.els[id] = document.getElementById(id);
    });
  },

  bindEvents() {
    this.els['btn-geo-yes'].addEventListener('click', () => this.requestGeolocation());
    this.els['btn-geo-no'].addEventListener('click', () => this.showScreen('manual-location'));

    this.els['btn-manual-submit'].addEventListener('click', () => this.submitManualCity());
    this.els['manual-city-input'].addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitManualCity();
    });

    this.els['btn-geo-retry'].addEventListener('click', () => this.requestGeolocation());
    this.els['btn-geo-search'].addEventListener('click', () => this.showScreen('manual-location'));

    this.els['search-input'].addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitSearch();
    });
    this.els['search-input'].addEventListener('blur', () => {
      if (this.els['search-input'].value.trim()) this.submitSearch();
    });

    this.els['radius-slider'].addEventListener('input', (e) => {
      this.state.radiusKm = Number(e.target.value);
      this.els['radius-value'].textContent = `${this.state.radiusKm} km`;
      MapView.setZoomForRadius(this.state.radiusKm);
      this.refreshEvents();
    });

    this.els['btn-geo-toggle'].addEventListener('click', () => this.openGeoModal());
    this.els['geo-modal-overlay'].addEventListener('click', () => this.closeGeoModal());
    this.els['geo-modal-cancel'].addEventListener('click', () => this.closeGeoModal());
    this.els['geo-modal-confirm'].addEventListener('click', () => this.handleGeoConfirm());

    this.els['btn-filters'].addEventListener('click', () => this.openFilters());
    this.els['filter-overlay'].addEventListener('click', () => this.closeFilters());
    this.els['filter-close'].addEventListener('click', () => this.closeFilters());
    this.els['filter-apply'].addEventListener('click', () => this.applyFilters());
    this.els['filter-clear'].addEventListener('click', () => this.clearFilters());

    this.els['btn-view-map'].addEventListener('click', () => this.setViewMode('map'));
    this.els['btn-view-list'].addEventListener('click', () => this.setViewMode('list'));

    window.addEventListener('resize', () => this.positionGeoToggle());

    this.els['match-card'].addEventListener('click', () => {
      if (this.state.screen === 'discover') {
        this.showMainTab('matches');
      }
    });

    this.els['bottom-nav']?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-main-tab]');
      if (!btn) return;
      this.showMainTab(btn.dataset.mainTab);
    });

    this.els['access-overlay']?.addEventListener('click', () => this.closeAccessFlow());
    this.els['access-content']?.addEventListener('click', (e) => this.handleAccessClick(e));
    this.els['access-content']?.addEventListener('input', (e) => this.handleAccessInput(e));
    this.els['access-content']?.addEventListener('submit', (e) => this.handleAccessSubmit(e));

    this.renderFilterOptions();
  },

  showMainTab(tab) {
    this.state.mainTab = tab;
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-active'));

    if (tab === 'discover') {
      this.state.screen = 'discover';
      this.els['screen-discover'].classList.add('is-active');
      this.updateBottomNav();
      this.initDiscover();
    } else if (tab === 'matches') {
      this.state.screen = 'matches';
      this.els['screen-matches'].classList.add('is-active');
      this.updateBottomNav();
      Matches.show();
    }
  },

  updateBottomNav() {
    const nav = this.els['bottom-nav'];
    if (!nav) return;
    const onMain =
      this.state.screen === 'discover' || this.state.screen === 'matches';
    nav.hidden = !onMain;
    nav.querySelectorAll('[data-main-tab]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.mainTab === this.state.mainTab);
    });
  },

  applySelectedMatch(matchSummary, { filterByMatch = true } = {}) {
    if (matchSummary) {
      this.state.selectedMatch = matchSummary;
    }
    this.state.filterEventsByMatch = filterByMatch;
    this.regenerateScenarioEvents();
    this.renderMatchCard();
    if (this.state.screen === 'discover' || this.state.mainTab === 'discover') {
      MapView.show(this.getMapCenter(), this.getMapZoom(), this.state.hasGeo);
      MapView.shouldFit = true;
      this.refreshEvents();
    }
  },

  getMapCenter() {
    if (this.state.hasGeo && this.state.userLocation) {
      return this.state.userLocation;
    }
    const city = CITIES[this.state.cityKey] || CITIES.london;
    return { lat: city.lat, lng: city.lng };
  },

  getMapZoom() {
    const city = CITIES[this.state.cityKey] || CITIES.london;
    return city.zoom;
  },

  getScenarioId() {
    return this.state.hasGeo
      ? `geo:${this.state.userLocation?.lat},${this.state.userLocation?.lng}`
      : `city:${this.state.cityKey}`;
  },

  regenerateScenarioEvents() {
    const center = this.getMapCenter();
    this.state.placedEvents = spawnEventsForScenario(
      this.state.hasGeo,
      this.state.cityKey,
      center,
      this.state.selectedMatch,
      this.state.filterEventsByMatch
    );
    this.state.scenarioId = this.getScenarioId();
  },

  showScreen(name) {
    this.state.screen = name;
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-active'));
    const screen = this.els[`screen-${name}`];
    if (screen) screen.classList.add('is-active');

    if (name === 'discover') {
      this.state.mainTab = 'discover';
      this.updateBottomNav();
      this.initDiscover();
    } else {
      this.els['bottom-nav'].hidden = true;
    }
  },

  requestGeolocation() {
    this.showLoading('Obteniendo tu ubicación…');

    if (!navigator.geolocation) {
      setTimeout(() => this.showScreen('geo-error'), 800);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.state.userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        this.state.hasGeo = true;
        this.state.cityKey = 'geo';
        this.state.city = null;
        setTimeout(() => this.enterDiscover(), 1000);
      },
      () => {
        setTimeout(() => this.showScreen('geo-error'), 800);
      },
      { timeout: 8000 }
    );
  },

  submitManualCity() {
    const query = this.els['manual-city-input'].value;
    const cityKey = resolveCity(query);

    if (!cityKey) {
      this.els['manual-city-error'].hidden = false;
      this.els['manual-city-input'].classList.add('field__input--error');
      return;
    }

    this.els['manual-city-error'].hidden = true;
    this.els['manual-city-input'].classList.remove('field__input--error');
    this.state.hasGeo = false;
    this.state.userLocation = null;
    this.state.cityKey = cityKey;
    this.state.city = CITIES[cityKey];
    this.showLoading('Buscando eventos…');
    setTimeout(() => this.enterDiscover(), 1000);
  },

  submitSearch() {
    const query = this.els['search-input'].value;
    const cityKey = resolveCity(query);

    if (!query.trim()) return;

    if (!cityKey) {
      this.state.searchError = 'No encontramos esa ciudad. Prueba con Londres, Ámsterdam o París.';
      this.els['search-error'].textContent = this.state.searchError;
      this.els['search-error'].hidden = false;
      this.els['search-input'].classList.add('field__input--error');
      return;
    }

    this.els['search-error'].hidden = true;
    this.els['search-input'].classList.remove('field__input--error');
    this.state.searchError = null;
    this.state.cityKey = cityKey;
    this.state.city = CITIES[cityKey];
    this.state.hasGeo = false;
    this.state.userLocation = null;
    this.state.searchQuery = query;
    this.updateRadiusControl();
    this.closePanel();
    const newScenarioId = `city:${cityKey}`;
    if (this.state.scenarioId !== newScenarioId) {
      this.regenerateScenarioEvents();
    }
    MapView.show(this.getMapCenter(), this.getMapZoom(), false);
    MapView.shouldFit = true;
    this.refreshEvents();
  },

  showLoading(message) {
    this.state.loading = true;
    this.els['loading-message'].textContent = message;
    this.showScreen('loading');
  },

  enterDiscover() {
    this.state.loading = false;
    this.state.emptyState = null;
    this.showScreen('discover');
  },

  updateRadiusControl() {
    if (this.els['radius-control']) {
      this.els['radius-control'].hidden = !this.state.hasGeo;
    }
  },

  updateGeoToggleBtn() {
    if (this.els['btn-geo-toggle']) {
      this.els['btn-geo-toggle'].classList.toggle('is-active', this.state.hasGeo);
    }
  },

  positionGeoToggle() {
    const mapArea = this.els['map-area'];
    const geoBtn = this.els['btn-geo-toggle'];
    if (!mapArea || !geoBtn) return;
    const zoomEl = mapArea.querySelector('.leaflet-control-zoom');
    if (!zoomEl) return;
    const mapRect = mapArea.getBoundingClientRect();
    const zoomRect = zoomEl.getBoundingClientRect();
    geoBtn.style.bottom = (mapRect.bottom - zoomRect.top + 8) + 'px';
  },

  openGeoModal() {
    const active = this.state.hasGeo;
    this.els['geo-modal-title'].textContent = active ? 'Desactivar ubicación' : 'Activar ubicación';
    this.els['geo-modal-text'].textContent = active
      ? 'Volverás a la vista por ciudad y se ocultará el radio de búsqueda.'
      : 'Activa tu ubicación para ver eventos cerca de ti y usar el radio de búsqueda.';
    const btn = this.els['geo-modal-confirm'];
    btn.textContent = active ? 'Desactivar' : 'Activar ubicación';
    btn.className = `btn btn--block ${active ? 'btn--ghost' : 'btn--primary'}`;
    this.els['geo-modal-overlay'].classList.add('is-open');
    this.els['geo-modal'].classList.add('is-open');
  },

  closeGeoModal() {
    this.els['geo-modal-overlay'].classList.remove('is-open');
    this.els['geo-modal'].classList.remove('is-open');
  },

  handleGeoConfirm() {
    this.closeGeoModal();
    if (this.state.hasGeo) {
      // Desactivar geo
      this.state.hasGeo = false;
      this.state.userLocation = null;
      if (MapView.userMarker) {
        MapView.map.removeLayer(MapView.userMarker);
        MapView.userMarker = null;
      }
      this.updateGeoToggleBtn();
      this.updateRadiusControl();
      const newId = `city:${this.state.cityKey}`;
      if (this.state.scenarioId !== newId) this.regenerateScenarioEvents();
      MapView.show(this.getMapCenter(), this.getMapZoom(), false);
      MapView.shouldFit = true;
      this.refreshEvents();
    } else {
      // Activar geo — reutiliza el flujo existente con loading
      this.requestGeolocation();
    }
  },

  initDiscover() {
    if (!this.state.city) {
      this.state.city = CITIES.london;
    }

    this.els['search-input'].value = this.state.city.name;
    this.els['radius-slider'].value = this.state.radiusKm;
    this.els['radius-value'].textContent = `${this.state.radiusKm} km`;
    this.updateRadiusControl();
    this.updateGeoToggleBtn();

    this.renderMatchCard();

    const scenarioId = this.getScenarioId();
    if (!MapView.map) {
      MapView.init(this.els['map-container']);
      MapView.onMapClick(() => this.closePanel());
    }
    if (this.state.scenarioId !== scenarioId || !this.state.placedEvents.length) {
      this.regenerateScenarioEvents();
    }

    MapView.show(this.getMapCenter(), this.getMapZoom(), this.state.hasGeo);
    requestAnimationFrame(() => this.positionGeoToggle());
    this.refreshEvents();
  },

  renderMatchCard() {
    const m = this.state.selectedMatch;
    if (!m) return;
    const teamTag = m.team === 'women' ? 'Femení' : 'Masculino';
    this.els['match-card'].innerHTML = `
      <div class="match-card__teams">
        ${crestHtml(m.home, m.homeAbbr, 'barca')}
        <span class="match-card__vs">vs</span>
        ${crestHtml(m.away, m.awayAbbr, 'rival')}
      </div>
      <div class="match-card__info">
        <div class="match-card__competition">${m.competition} · ${teamTag}</div>
        <div class="match-card__datetime">${m.datetimeLabel}</div>
      </div>
      <svg class="match-card__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
    `;
  },

  getFilteredEvents() {
    return filterEvents(this.state.placedEvents, {
      radiusKm: this.state.radiusKm,
      filters: this.state.filters,
      hasGeo: this.state.hasGeo,
    });
  },

  refreshEvents() {
    const events = this.getFilteredEvents();
    const activeFilters =
      this.state.filters.spaceType.length + this.state.filters.category.length;

    this.els['filter-badge'].textContent = activeFilters;
    this.els['filter-badge'].hidden = activeFilters === 0;

    this.updateEmptyState(events);
    this.renderList(events);
    MapView.renderPins(events, this.state.selectedEvent?.id, (event) =>
      this.openPanel(event)
    );

    if (this.state.panelOpen && this.state.selectedEvent) {
      const still = events.find((e) => e.id === this.state.selectedEvent.id);
      if (still) {
        this.state.selectedEvent = still;
        this.renderPanel(still);
      } else {
        this.closePanel();
      }
    }
  },

  updateEmptyState(events) {
    const hasFilters =
      this.state.filters.spaceType.length > 0 ||
      this.state.filters.category.length > 0;

    let state = null;
    if (events.length === 0 && hasFilters) {
      state = 'no-filter-results';
    } else if (events.length === 0) {
      state = 'no-events';
    }

    this.state.emptyState = state;
    const el = this.els['empty-state'];
    if (!state) {
      el.hidden = true;
      return;
    }

    // Medir el header real para que el overlay no lo tape
    const header = this.els['screen-discover'].querySelector('.discover__header');
    if (header) {
      el.style.top = header.offsetHeight + 'px';
    }

    el.hidden = false;
    const actions = this.els['empty-actions'];

    switch (state) {
      case 'no-events':
        this.els['empty-title'].textContent = 'No hay eventos en esta zona';
        this.els['empty-text'].textContent =
          'Prueba ampliar el radio de búsqueda o buscar en otra ciudad.';
        actions.innerHTML = `
          <button class="btn btn--secondary btn--block" id="empty-expand-radius">Ampliar radio a 15 km</button>
          <button class="btn btn--ghost btn--block" id="empty-change-city">Buscar otra zona</button>
          <p class="caption" style="margin-top: var(--space-2)">Próximamente podrás crear tu propio evento</p>
        `;
        document.getElementById('empty-expand-radius')?.addEventListener('click', () => {
          this.state.radiusKm = 15;
          this.els['radius-slider'].value = 15;
          this.els['radius-value'].textContent = '15 km';
          this.refreshEvents();
        });
        document.getElementById('empty-change-city')?.addEventListener('click', () => {
          this.els['search-input'].focus();
          el.hidden = true;
        });
        break;

      case 'no-filter-results':
        this.els['empty-title'].textContent = 'Sin resultados con estos filtros';
        this.els['empty-text'].textContent =
          'Modifica o elimina los filtros para ver más eventos.';
        actions.innerHTML = `
          <button class="btn btn--secondary btn--block" id="empty-clear-filters">Eliminar filtros</button>
          <button class="btn btn--ghost btn--block" id="empty-modify-filters">Modificar filtros</button>
        `;
        document.getElementById('empty-clear-filters')?.addEventListener('click', () => {
          this.clearFilters(true);
        });
        document.getElementById('empty-modify-filters')?.addEventListener('click', () => {
          this.openFilters();
          el.hidden = true;
        });
        break;
    }
  },

  renderList(events) {
    const list = this.els['event-list'];
    if (!events.length) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = events
      .map(
        (e) => `
      <article class="event-card" data-id="${e.id}">
        <div class="event-card__banner event-card__banner--${e.category}"></div>
        <div class="event-card__body">
          <h3 class="event-card__name">${e.name}</h3>
          <p class="event-card__location">${e.location}</p>
          <div class="event-card__meta">
            ${e.distanceKm !== undefined ? `<span class="event-card__distance">${formatDistance(e.distanceKm)}</span>` : '<span></span>'}
            <span class="event-card__capacity">${e.reserved}/${e.capacity} plazas</span>
          </div>
        </div>
      </article>
    `
      )
      .join('');

    list.querySelectorAll('.event-card').forEach((card) => {
      card.addEventListener('click', () => {
        const event = events.find((e) => e.id === card.dataset.id);
        if (event) {
          this.setViewMode('map');
          this.openPanel(event);
        }
      });
    });
  },

  openPanel(event) {
    this.state.selectedEvent = event;
    this.state.panelOpen = true;
    this.els['event-panel'].classList.add('is-open');
    this.renderPanel(event);
    MapView.renderPins(this.getFilteredEvents(), event.id, (ev) =>
      this.openPanel(ev)
    );
  },

  closePanel() {
    this.state.panelOpen = false;
    this.state.selectedEvent = null;
    this.els['event-panel'].classList.remove('is-open');
    MapView.renderPins(this.getFilteredEvents(), null, (ev) =>
      this.openPanel(ev)
    );
  },

  renderPanel(event) {
    const dist =
      event.distanceKm !== undefined
        ? formatDistance(event.distanceKm)
        : '—';

    this.els['panel-content'].innerHTML = `
      <div class="event-panel__header">
        <div>
          <h2 class="event-panel__name">${event.name}</h2>
          <p class="event-panel__location">${event.location} · ${event.address}</p>
        </div>
        <button class="event-panel__close" id="panel-close-inner" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      ${this.state.accessMessage && this.state.accessMessage.eventId === event.id ? `
        <p class="alert alert--success">${this.state.accessMessage.text}</p>
      ` : ''}
      <div class="event-panel__details">
        ${this.state.hasGeo ? `<div class="event-panel__detail"><strong>${dist}</strong>de distancia</div>` : ''}
        <div class="event-panel__detail"><strong>${event.reserved}/${event.capacity}</strong>plazas reservadas</div>
      </div>
      <div class="event-panel__actions">
        <button class="btn btn--ghost btn--no-action" type="button" tabindex="-1" style="flex: 1">Más detalles</button>
        <button class="btn btn--primary" type="button" id="panel-reserve-btn" style="flex: 1">Reservar plaza</button>
      </div>
    `;

    document.getElementById('panel-close-inner')?.addEventListener('click', () =>
      this.closePanel()
    );
    document.getElementById('panel-reserve-btn')?.addEventListener('click', () =>
      this.startReservationFlow(event)
    );
  },

  startReservationFlow(event) {
    this.state.reservationIntent = { eventId: event.id };
    this.state.accessTechnicalError = false;
    this.state.authStep = this.state.authUser ? 'ready' : 'entry';
    this.openAccessFlow();
  },

  openAccessFlow() {
    this.state.authModalOpen = true;
    this.renderAccessFlow();
    this.els['access-overlay'].classList.add('is-open');
    this.els['access-sheet'].classList.add('is-open');
  },

  closeAccessFlow() {
    this.state.authModalOpen = false;
    this.state.accessTechnicalError = false;
    this.state.accessSubmitting = false;
    this.els['access-overlay'].classList.remove('is-open');
    this.els['access-sheet'].classList.remove('is-open');
  },

  handleAccessClick(e) {
    const action = e.target.closest('[data-access-action]')?.dataset.accessAction;
    if (!action) return;

    if (action === 'close') {
      this.closeAccessFlow();
      return;
    }
    if (action === 'go-register') {
      this.state.authStep = 'register';
      this.state.accessTechnicalError = false;
      this.renderAccessFlow();
      return;
    }
    if (action === 'go-login') {
      this.state.authStep = 'login';
      this.state.accessTechnicalError = false;
      this.renderAccessFlow();
      return;
    }
    if (action === 'demo-social') {
      this.showInlineAccessNotice('Esta opción no es funcional en la demo. Continúa con correo electrónico.');
      return;
    }
    if (action === 'toggle-password') {
      const fieldId = e.target.closest('[data-field-id]')?.dataset.fieldId;
      const input = fieldId ? document.getElementById(fieldId) : null;
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      e.target.closest('[data-access-action]').textContent =
        input.type === 'password' ? 'Mostrar' : 'Ocultar';
      return;
    }
    if (action === 'open-terms') {
      this.showInlineAccessNotice('En la demo, términos y privacidad se muestran como contenido informativo.');
      return;
    }
    if (action === 'continue-reservation') {
      this.completeAccessFlow();
    }
  },

  handleAccessInput(e) {
    const field = e.target.closest('.field');
    if (!field) return;
    field.querySelector('.field__error')?.setAttribute('hidden', '');
    e.target.classList.remove('field__input--error');
  },

  handleAccessSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.mode === 'register') {
      this.submitRegister(form);
    } else if (form.dataset.mode === 'login') {
      this.submitLogin(form);
    }
  },

  submitRegister(form) {
    if (this.state.accessSubmitting) return;
    this.clearAccessErrors(form);
    const data = Object.fromEntries(new FormData(form).entries());
    let hasErrors = false;

    hasErrors = this.validateRequired(form, 'register-first-name', data.firstName, 'Introduce tu nombre.') || hasErrors;
    hasErrors = this.validateRequired(form, 'register-last-name', data.lastName, 'Introduce tus apellidos.') || hasErrors;
    hasErrors = this.validateEmail(form, 'register-email', data.email) || hasErrors;
    hasErrors = this.validatePassword(form, 'register-password', data.password) || hasErrors;

    if (!data.terms) {
      this.showFieldError(form, 'register-terms', 'Debes aceptar los términos para continuar.');
      hasErrors = true;
    }

    const existingUser = this.findUserByEmail(data.email);
    if (existingUser) {
      this.showFieldError(form, 'register-email', 'Ya existe una cuenta con este correo. Inicia sesión.');
      hasErrors = true;
    }

    if (hasErrors) return;

    this.state.accessSubmitting = true;
    this.renderAccessFlow(data);

    setTimeout(() => {
      this.state.accessSubmitting = false;

      if (String(data.email).trim().toLowerCase() === 'error@demo.com') {
        this.state.accessTechnicalError = true;
        this.renderAccessFlow(data);
        return;
      }

      const newUser = {
        firstName: String(data.firstName).trim(),
        lastName: String(data.lastName).trim(),
        email: String(data.email).trim().toLowerCase(),
        password: String(data.password),
        city: String(data.city || '').trim(),
        area: String(data.area || '').trim(),
      };
      this.state.existingUsers.push(newUser);
      this.state.authUser = newUser;
      this.state.accessMessage = {
        eventId: this.state.reservationIntent?.eventId,
        text: 'Tu cuenta se ha creado correctamente. Ya puedes continuar con la reserva.',
      };
      this.state.authStep = 'ready';
      this.renderAccessFlow();
      setTimeout(() => {
        if (this.state.authModalOpen && this.state.authStep === 'ready') {
          this.completeAccessFlow();
        }
      }, 1100);
    }, 800);
  },

  submitLogin(form) {
    if (this.state.accessSubmitting) return;
    this.clearAccessErrors(form);
    const data = Object.fromEntries(new FormData(form).entries());
    let hasErrors = false;

    hasErrors = this.validateEmail(form, 'login-email', data.email) || hasErrors;
    hasErrors = this.validateRequired(form, 'login-password', data.password, 'Introduce tu contraseña.') || hasErrors;
    if (hasErrors) return;

    const user = this.findUserByEmail(data.email);
    if (!user || user.password !== data.password) {
      this.showFieldError(form, 'login-email', 'No encontramos una cuenta con ese correo y contraseña.');
      this.showFieldError(form, 'login-password', 'Revisa tus credenciales e inténtalo de nuevo.');
      return;
    }

    this.state.authUser = user;
    this.state.accessMessage = {
      eventId: this.state.reservationIntent?.eventId,
      text: 'Has iniciado sesión. Revisa el evento y continúa con la reserva.',
    };
    this.completeAccessFlow();
  },

  completeAccessFlow() {
    const event = this.getReservationEvent();
    this.closeAccessFlow();
    if (!event) return;
    if (event.reserved >= event.capacity) {
      this.state.accessMessage = {
        eventId: event.id,
        text: 'Evento completo. Ya no quedan plazas disponibles para continuar.',
      };
    }
    this.openPanel(event);
  },

  getReservationEvent() {
    if (!this.state.reservationIntent?.eventId) return null;
    return this.state.placedEvents.find((event) => event.id === this.state.reservationIntent.eventId) || null;
  },

  findUserByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    return this.state.existingUsers.find((user) => user.email === normalized) || null;
  },

  validateRequired(form, fieldId, value, message) {
    if (String(value || '').trim()) return false;
    this.showFieldError(form, fieldId, message);
    return true;
  },

  validateEmail(form, fieldId, value) {
    const email = String(value || '').trim();
    if (!email) {
      this.showFieldError(form, fieldId, 'Introduce tu correo electrónico.');
      return true;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      this.showFieldError(form, fieldId, 'Introduce un correo válido.');
      return true;
    }
    return false;
  },

  validatePassword(form, fieldId, value) {
    const password = String(value || '');
    if (!password) {
      this.showFieldError(form, fieldId, 'Introduce una contraseña.');
      return true;
    }
    if (password.length < 8) {
      this.showFieldError(form, fieldId, 'La contraseña debe tener al menos 8 caracteres.');
      return true;
    }
    return false;
  },

  clearAccessErrors(form) {
    form.querySelectorAll('.field__error').forEach((el) => el.setAttribute('hidden', ''));
    form.querySelectorAll('.field__input').forEach((input) => input.classList.remove('field__input--error'));
    form.querySelectorAll('.access-checkbox__error').forEach((el) => el.setAttribute('hidden', ''));
  },

  showFieldError(form, fieldId, message) {
    const input = form.querySelector(`#${fieldId}`);
    if (input) {
      input.classList.add('field__input--error');
      const field = input.closest('.field');
      field?.querySelector('.field__error')?.removeAttribute('hidden');
      if (field?.querySelector('.field__error')) {
        field.querySelector('.field__error').textContent = message;
      }
      return;
    }

    const checkbox = form.querySelector(`[data-error-for="${fieldId}"]`);
    if (checkbox) {
      checkbox.textContent = message;
      checkbox.removeAttribute('hidden');
    }
  },

  showInlineAccessNotice(message) {
    const notice = this.els['access-content']?.querySelector('#access-inline-notice');
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = false;
  },

  renderAccessFlow(prefill = {}) {
    const event = this.getReservationEvent() || this.state.selectedEvent;
    if (!event) return;

    const content = this.els['access-content'];
    const titleId = 'access-title';
    const eventLabel = `${event.name} · ${event.location}`;

    if (this.state.authStep === 'entry') {
      content.innerHTML = `
        <div class="access-sheet__header">
          <div>
            <p class="access-sheet__overline">Reserva protegida</p>
            <h2 class="access-sheet__title" id="${titleId}">Crea tu cuenta para reservar</h2>
          </div>
          <button type="button" class="access-sheet__close" data-access-action="close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <p class="access-sheet__context">Estás intentando reservar en <strong>${eventLabel}</strong>. Al completar el registro volverás a este evento.</p>
        <p class="alert alert--info" id="access-inline-notice" hidden></p>
        <div class="access-social-grid">
          <button type="button" class="access-social-btn" data-access-action="demo-social">
            <svg class="access-social-btn__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.3z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 5-.9 6.6-2.4l-3.4-2.5c-.8.6-1.9.9-3.2.9-2.5 0-4.6-1.7-5.4-3.9H1.1v2.6C2.7 17.9 6.1 20 10 20z" fill="#34A853"/>
              <path d="M4.6 12.1C4.4 11.5 4.3 10.8 4.3 10s.1-1.5.3-2.1V5.3H1.1C.4 6.7 0 8.3 0 10s.4 3.3 1.1 4.7l3.5-2.6z" fill="#FBBC04"/>
              <path d="M10 4c1.4 0 2.7.5 3.7 1.4l2.8-2.8C14.9.9 12.7 0 10 0 6.1 0 2.7 2.1 1.1 5.3l3.5 2.6C5.4 5.7 7.5 4 10 4z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" class="access-social-btn" data-access-action="demo-social">
            <svg class="access-social-btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
            Apple
          </button>
        </div>
        <div class="access-divider">o</div>
        <button type="button" class="btn btn--primary btn--block" data-access-action="go-register">Continuar con correo electrónico</button>
        <button type="button" class="access-sheet__link" data-access-action="go-login">Ya tengo una cuenta</button>
      `;
      return;
    }

    if (this.state.authStep === 'login') {
      content.innerHTML = `
        <div class="access-sheet__header">
          <div>
            <p class="access-sheet__overline">Acceso</p>
            <h2 class="access-sheet__title" id="${titleId}">Inicia sesión para reservar</h2>
          </div>
          <button type="button" class="access-sheet__close" data-access-action="close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <p class="access-sheet__context">Volverás automáticamente a <strong>${eventLabel}</strong> al completar el acceso.</p>
        <p class="alert alert--info" id="access-inline-notice" hidden></p>
        <div class="access-social-grid">
          <button type="button" class="access-social-btn" data-access-action="demo-social">
            <svg class="access-social-btn__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.3z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 5-.9 6.6-2.4l-3.4-2.5c-.8.6-1.9.9-3.2.9-2.5 0-4.6-1.7-5.4-3.9H1.1v2.6C2.7 17.9 6.1 20 10 20z" fill="#34A853"/>
              <path d="M4.6 12.1C4.4 11.5 4.3 10.8 4.3 10s.1-1.5.3-2.1V5.3H1.1C.4 6.7 0 8.3 0 10s.4 3.3 1.1 4.7l3.5-2.6z" fill="#FBBC04"/>
              <path d="M10 4c1.4 0 2.7.5 3.7 1.4l2.8-2.8C14.9.9 12.7 0 10 0 6.1 0 2.7 2.1 1.1 5.3l3.5 2.6C5.4 5.7 7.5 4 10 4z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" class="access-social-btn" data-access-action="demo-social">
            <svg class="access-social-btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
            Apple
          </button>
        </div>
        <div class="access-divider">o</div>
        <form class="access-form" data-mode="login" novalidate>
          <div class="field">
            <label class="field__label" for="login-email">Correo electrónico</label>
            <div class="field__input-wrap">
              <input class="field__input access-form__plain-input" id="login-email" name="email" type="email" autocomplete="email" value="${prefill.email || ''}">
            </div>
            <p class="field__error" hidden></p>
          </div>
          <div class="field">
            <label class="field__label" for="login-password">Contraseña</label>
            <div class="field__input-wrap access-form__password-wrap">
              <input class="field__input access-form__plain-input access-form__password-input" id="login-password" name="password" type="password" autocomplete="current-password">
              <button class="access-form__password-toggle" type="button" data-access-action="toggle-password" data-field-id="login-password">Mostrar</button>
            </div>
            <p class="field__error" hidden></p>
          </div>
          <button class="btn btn--primary btn--block" type="submit">Iniciar sesión y continuar</button>
        </form>
        <button type="button" class="access-sheet__link" data-access-action="go-register">Crear una cuenta nueva</button>
      `;
      return;
    }

    if (this.state.authStep === 'ready') {
      content.innerHTML = `
        <div class="access-sheet__header">
          <div>
            <p class="access-sheet__overline">Cuenta creada</p>
            <h2 class="access-sheet__title" id="${titleId}">Tu cuenta ya está lista</h2>
          </div>
        </div>
        <p class="alert alert--success">Tu cuenta se ha creado correctamente.</p>
        <p class="access-sheet__context">Volverás al evento para revisar la reserva de <strong>${eventLabel}</strong>.</p>
        <button class="btn btn--primary btn--block" type="button" data-access-action="continue-reservation">Continuar con la reserva</button>
      `;
      return;
    }

    content.innerHTML = `
      <div class="access-sheet__header">
        <div>
          <p class="access-sheet__overline">Registro con correo</p>
          <h2 class="access-sheet__title" id="${titleId}">Completa tus datos</h2>
        </div>
        <button type="button" class="access-sheet__close" data-access-action="close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      ${this.state.accessTechnicalError ? `
        <p class="alert alert--danger">No pudimos crear la cuenta ahora mismo. Tus datos se han conservado — inténtalo de nuevo.</p>
      ` : ''}
      <form class="access-form" data-mode="register" novalidate>
        <div class="field">
          <label class="field__label" for="register-first-name">Nombre *</label>
          <div class="field__input-wrap">
            <input class="field__input access-form__plain-input" id="register-first-name" name="firstName" autocomplete="given-name" value="${prefill.firstName || ''}">
          </div>
          <p class="field__error" hidden></p>
        </div>
        <div class="field">
          <label class="field__label" for="register-last-name">Apellidos *</label>
          <div class="field__input-wrap">
            <input class="field__input access-form__plain-input" id="register-last-name" name="lastName" autocomplete="family-name" value="${prefill.lastName || ''}">
          </div>
          <p class="field__error" hidden></p>
        </div>
        <div class="field">
          <label class="field__label" for="register-email">Correo electrónico *</label>
          <div class="field__input-wrap">
            <input class="field__input access-form__plain-input" id="register-email" name="email" type="email" autocomplete="email" value="${prefill.email || ''}">
          </div>
          <p class="field__error" hidden></p>
        </div>
        <div class="field">
          <label class="field__label" for="register-password">Contraseña *</label>
          <div class="field__input-wrap access-form__password-wrap">
            <input class="field__input access-form__plain-input access-form__password-input" id="register-password" name="password" type="password" autocomplete="new-password" value="${prefill.password || ''}">
            <button class="access-form__password-toggle" type="button" data-access-action="toggle-password" data-field-id="register-password">Mostrar</button>
          </div>
          <p class="field__helper">Mínimo 8 caracteres.</p>
          <p class="field__error" hidden></p>
        </div>
        <p class="access-form__section-title">Datos opcionales</p>
        <div class="access-form__row">
          <div class="field">
            <label class="field__label" for="register-city">Ciudad</label>
            <div class="field__input-wrap">
              <input class="field__input access-form__plain-input" id="register-city" name="city" autocomplete="address-level2" value="${prefill.city || ''}">
            </div>
            <p class="field__error" hidden></p>
          </div>
          <div class="field">
            <label class="field__label" for="register-area">Zona o barrio</label>
            <div class="field__input-wrap">
              <input class="field__input access-form__plain-input" id="register-area" name="area" value="${prefill.area || ''}">
            </div>
            <p class="field__error" hidden></p>
          </div>
        </div>
        <label class="access-checkbox">
          <input id="register-terms" name="terms" type="checkbox" ${prefill.terms ? 'checked' : ''}>
          <span>Acepto los <button class="access-inline-link" type="button" data-access-action="open-terms">términos de uso</button> y la <button class="access-inline-link" type="button" data-access-action="open-terms">política de privacidad</button>.</span>
        </label>
        <p class="field__error access-checkbox__error" data-error-for="register-terms" hidden></p>
        <button class="btn btn--primary btn--block" type="submit" ${this.state.accessSubmitting ? 'disabled' : ''}>
          ${this.state.accessSubmitting ? 'Creando cuenta…' : 'Crear cuenta y continuar'}
        </button>
      </form>
      <button type="button" class="access-sheet__link" data-access-action="go-login">Ya tengo una cuenta</button>
    `;
  },

  setViewMode(mode) {
    this.state.viewMode = mode;
    this.els['btn-view-map'].classList.toggle('is-active', mode === 'map');
    this.els['btn-view-list'].classList.toggle('is-active', mode === 'list');
    this.els['map-area'].classList.toggle('is-hidden', mode === 'list');
    this.els['list-container'].classList.toggle('is-visible', mode === 'list');
    if (mode === 'map') {
      MapView.invalidateSize();
    }
  },

  renderFilterOptions() {
    const renderChips = (container, options, group) => {
      container.innerHTML = options
        .map(
          (opt) =>
            `<button type="button" class="filter-chip" data-group="${group}" data-id="${opt.id}">${opt.label}</button>`
        )
        .join('');

      container.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('is-active');
        });
      });
    };

    renderChips(this.els['filter-space-types'], FILTER_OPTIONS.spaceType, 'spaceType');
    renderChips(this.els['filter-categories'], FILTER_OPTIONS.category, 'category');
  },

  openFilters() {
    this.state.filtersOpen = true;
    this.els['filter-overlay'].classList.add('is-open');
    this.els['filter-sheet'].classList.add('is-open');

    ['spaceType', 'category'].forEach((group) => {
      const container =
        group === 'spaceType'
          ? this.els['filter-space-types']
          : this.els['filter-categories'];
      container.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.classList.toggle(
          'is-active',
          this.state.filters[group].includes(chip.dataset.id)
        );
      });
    });
  },

  closeFilters() {
    this.state.filtersOpen = false;
    this.els['filter-overlay'].classList.remove('is-open');
    this.els['filter-sheet'].classList.remove('is-open');
  },

  applyFilters() {
    const readChips = (container) =>
      [...container.querySelectorAll('.filter-chip.is-active')].map(
        (c) => c.dataset.id
      );

    this.state.filters = {
      spaceType: readChips(this.els['filter-space-types']),
      category: readChips(this.els['filter-categories']),
    };

    this.closeFilters();
    this.refreshEvents();
  },

  clearFilters(applyNow = false) {
    this.state.filters = { spaceType: [], category: [] };
    this.els['filter-space-types']
      .querySelectorAll('.filter-chip')
      .forEach((c) => c.classList.remove('is-active'));
    this.els['filter-categories']
      .querySelectorAll('.filter-chip')
      .forEach((c) => c.classList.remove('is-active'));

    if (applyNow) {
      this.closeFilters();
      this.refreshEvents();
    }
  },

};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  Matches.init();
});
