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
    cityKey: 'barcelona',
    placedEvents: [],
    scenarioId: null,
    filterEventsByMatch: true,
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
    const city = CITIES[this.state.cityKey] || CITIES.barcelona;
    return { lat: city.lat, lng: city.lng };
  },

  getMapZoom() {
    const city = CITIES[this.state.cityKey] || CITIES.barcelona;
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
        this.state.cityKey = 'barcelona';
        this.state.city = CITIES.barcelona;
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
      this.state.searchError = 'No encontramos esa ciudad. Prueba con Barcelona, Madrid o Valencia.';
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
      this.state.city = CITIES.barcelona;
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
      <div class="event-panel__details">
        ${this.state.hasGeo ? `<div class="event-panel__detail"><strong>${dist}</strong>de distancia</div>` : ''}
        <div class="event-panel__detail"><strong>${event.reserved}/${event.capacity}</strong>plazas reservadas</div>
      </div>
      <div class="event-panel__actions">
        <button class="btn btn--ghost btn--no-action" type="button" tabindex="-1" style="flex: 1">Más detalles</button>
        <button class="btn btn--primary btn--no-action" type="button" tabindex="-1" style="flex: 1">Reservar plaza</button>
      </div>
    `;

    document.getElementById('panel-close-inner')?.addEventListener('click', () =>
      this.closePanel()
    );
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
