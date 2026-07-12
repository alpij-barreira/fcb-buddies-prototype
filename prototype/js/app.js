/* Barça Buddies — App shell (flujo "partido primero", modo oscuro) */

const App = {
  state: {
    screen: 'home',
    mainTab: 'home',
    // Sesión simulada: se asume login hecho al abrir la app
    authUser: {
      firstName: 'Javier',
      lastName: 'Culé',
      email: 'javier@buddies.demo',
      city: 'Londres',
      area: 'Camden',
    },
    // Ubicación de búsqueda
    search: { hasGeo: false, cityKey: 'london', userLocation: null },
    geoLoading: false,
    geoError: false,
    venuesCache: {},        // `${matchId}::${scenarioKey}` -> [venues]
    selectedMatchId: null,
    selectedVenueId: null,
    reserveVenueId: null,
    reservePlazas: 1,
    // Orden y filtros de la lista de sitios
    venueSort: 'distance',
    venueFilters: { spaceType: [], hideFull: false, minRating: 0 },
    venueFavOnly: false,
    venueOptsDraft: null,
    // Locales favoritos (ids de plantilla; persisten en localStorage)
    favorites: [],
    tickets: [],
    mapExpanded: false,
    ticketSeq: 0,
  },

  els: {},

  init() {
    this.cacheElements();
    this.loadFavorites();
    this.bindEvents();
    this.showScreen('home');
    this.updateMiniNav();
    this.updateTicketsBadge();
    this.updateLocationChip();
    // Primer arranque: pedir ubicación sobre el home ya montado
    this.openLocationModal({ firstRun: true });
  },

  cacheElements() {
    const ids = [
      'screen-home', 'screen-match-detail', 'screen-venue-detail', 'screen-tickets',
      'home-content', 'match-detail-content', 'venue-detail-content', 'tickets-content',
      'mini-nav', 'tickets-badge',
      'home-location', 'home-location-label',
      'reserve-overlay', 'reserve-sheet', 'reserve-content',
      'ticket-overlay', 'ticket-stage',
      'location-overlay', 'location-sheet', 'location-content',
      'venue-opts-overlay', 'venue-opts-sheet', 'venue-opts-content',
      'profile-overlay', 'profile-sheet', 'profile-content',
    ];
    ids.forEach((id) => { this.els[id] = document.getElementById(id); });
  },

  bindEvents() {
    // Mini-nav
    this.els['mini-nav'].addEventListener('click', (e) => {
      const btn = e.target.closest('[data-main-tab]');
      if (btn) this.showMainTab(btn.dataset.mainTab);
    });

    // Botones "volver" (headers de detalle)
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-nav-back]')) this.navBack();
    });

    // Perfil (la tarjeta que lo abre vive en Mis entradas, con delegación)
    this.els['profile-overlay'].addEventListener('click', () => this.closeProfile());
    this.els['profile-content'].addEventListener('click', (e) => {
      if (e.target.closest('[data-profile-action="close"]')) this.closeProfile();
    });

    // Ubicación
    this.els['home-location'].addEventListener('click', () => this.openLocationModal());
    this.els['location-overlay'].addEventListener('click', () => this.closeLocationModal());
    this.els['location-content'].addEventListener('click', (e) => this.handleLocationClick(e));
    this.els['location-content'].addEventListener('submit', (e) => this.handleLocationSubmit(e));

    // Detalle de partido → abrir sitio / ordenar-filtrar / favoritos
    this.els['match-detail-content'].addEventListener('click', (e) => {
      const fav = e.target.closest('[data-fav-toggle]');
      if (fav) { e.stopPropagation(); this.toggleFavorite(fav.dataset.favToggle); return; }
      if (e.target.closest('[data-fav-only]')) { this.toggleFavOnly(); return; }
      const opts = e.target.closest('[data-open-venue-opts]');
      if (opts) { this.openVenueOpts(opts.dataset.openVenueOpts); return; }
      if (e.target.closest('[data-clear-venue-filters]')) { this.clearVenueOpts(true); return; }
      const card = e.target.closest('[data-venue-id]');
      if (card) this.openVenueDetail(card.dataset.venueId);
    });

    // Sheet de ordenar/filtrar
    this.els['venue-opts-overlay'].addEventListener('click', () => this.closeVenueOpts());
    this.els['venue-opts-content'].addEventListener('click', (e) => this.handleVenueOptsClick(e));

    // Detalle de sitio → mapa / reservar / favorito
    this.els['venue-detail-content'].addEventListener('click', (e) => {
      const fav = e.target.closest('[data-fav-toggle]');
      if (fav) { this.toggleFavorite(fav.dataset.favToggle); return; }
      const mapAction = e.target.closest('[data-map-action]')?.dataset.mapAction;
      if (mapAction === 'expand') { this.expandMap(); return; }
      if (mapAction === 'collapse') { this.collapseMap(); return; }
      const reserveOpen = e.target.closest('[data-reserve-open]')?.dataset.reserveOpen;
      if (reserveOpen) this.openReserve(reserveOpen);
    });

    // Sheet de reserva
    this.els['reserve-overlay'].addEventListener('click', () => this.closeReserve());
    this.els['reserve-content'].addEventListener('click', (e) => this.handleReserveClick(e));

    // Overlay del ticket
    this.els['ticket-stage'].addEventListener('click', (e) => {
      const action = e.target.closest('[data-ticket-action]')?.dataset.ticketAction;
      if (action === 'tickets') { this.closeTicket(); this.showMainTab('tickets'); }
      else if (action === 'done') { this.closeTicket(); }
    });

    // Mis entradas → perfil / reabrir ticket
    this.els['tickets-content'].addEventListener('click', (e) => {
      if (e.target.closest('[data-open-profile]')) { this.openProfile(); return; }
      const item = e.target.closest('[data-ticket-id]');
      if (item) {
        const t = this.state.tickets.find((x) => x.id === item.dataset.ticketId);
        if (t) this.showTicket(t, { animate: false });
        return;
      }
      if (e.target.closest('[data-go-home]')) this.showMainTab('home');
    });

    // Autoocultar mini-nav al hacer scroll
    ['home-content', 'match-detail-content', 'venue-detail-content', 'tickets-content']
      .forEach((id) => this.enableAutohide(this.els[id]));
  },

  /* ============================ Navegación ============================ */

  showScreen(name) {
    this.state.screen = name;
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-active'));
    const el = this.els[`screen-${name}`];
    if (el) el.classList.add('is-active');
    this.els['mini-nav'].classList.remove('is-hidden');
  },

  showMainTab(tab) {
    this.state.mainTab = tab;
    if (this.state.mapExpanded) this.collapseMap();
    if (tab === 'home') {
      this.showScreen('home');
      Home.show();
    } else if (tab === 'tickets') {
      this.renderTickets();
      this.showScreen('tickets');
    }
    this.updateMiniNav();
  },

  updateMiniNav() {
    const activeTab = this.state.mainTab;
    this.els['mini-nav'].querySelectorAll('[data-main-tab]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.mainTab === activeTab);
    });
  },

  navBack() {
    if (this.state.mapExpanded) { this.collapseMap(); return; }
    if (this.state.screen === 'venue-detail') {
      // Refresca la lista para reflejar favoritos/aforo tras entrar en un sitio
      this.renderMatchDetail();
      this.showScreen('match-detail');
    } else if (this.state.screen === 'match-detail') {
      this.showMainTab('home');
    }
  },

  enableAutohide(el) {
    if (!el) return;
    el.addEventListener('scroll', () => {
      const st = el.scrollTop;
      const last = el._lastScrollTop || 0;
      const nav = this.els['mini-nav'];
      if (st > last && st > 48) nav.classList.add('is-hidden');
      else if (st < last) nav.classList.remove('is-hidden');
      el._lastScrollTop = st <= 0 ? 0 : st;
    }, { passive: true });
  },

  /* ============================ Ubicación de búsqueda ============================ */

  scenarioKey() {
    const s = this.state.search;
    return s.hasGeo && s.userLocation
      ? `geo:${s.userLocation.lat.toFixed(3)},${s.userLocation.lng.toFixed(3)}`
      : `city:${s.cityKey}`;
  },

  getSearchCenter() {
    const s = this.state.search;
    if (s.hasGeo && s.userLocation) {
      return { lat: s.userLocation.lat, lng: s.userLocation.lng };
    }
    const c = CITIES[s.cityKey] || CITIES.london;
    return { lat: c.lat, lng: c.lng };
  },

  getSearchContext() {
    const s = this.state.search;
    return { hasGeo: s.hasGeo, cityKey: s.cityKey, center: this.getSearchCenter() };
  },

  getSearchLabel() {
    const s = this.state.search;
    if (s.hasGeo) return 'tu ubicación';
    return (CITIES[s.cityKey] || CITIES.london).name;
  },

  updateLocationChip() {
    if (this.els['home-location-label']) {
      this.els['home-location-label'].textContent = this.getSearchLabel();
    }
  },

  invalidateVenues() {
    this.state.venuesCache = {};
  },

  openLocationModal({ firstRun = false } = {}) {
    this.state.locationFirstRun = firstRun;
    this.state.geoError = false;
    this.renderLocationModal();
    this.els['location-overlay'].classList.add('is-open');
    this.els['location-sheet'].classList.add('is-open');
  },

  closeLocationModal() {
    this.els['location-overlay'].classList.remove('is-open');
    this.els['location-sheet'].classList.remove('is-open');
  },

  renderLocationModal() {
    const loading = this.state.geoLoading;
    this.els['location-content'].innerHTML = `
      <div class="access-sheet__header">
        <div>
          <p class="access-sheet__overline">Ubicación</p>
          <h2 class="access-sheet__title" id="location-title">¿Dónde quieres verlo?</h2>
        </div>
        <button type="button" class="access-sheet__close" data-loc-action="close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <p class="location-modal__sub">Te mostraremos los sitios para ver el partido más cercanos a la ubicación que elijas.</p>
      ${this.state.geoError ? `<p class="alert alert--danger">No pudimos obtener tu ubicación. Escribe una ubicación o continúa con la demo.</p>` : ''}
      <button type="button" class="btn btn--secondary btn--block" data-loc-action="geo" ${loading ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/><circle cx="12" cy="9" r="2.5"/></svg>
        ${loading ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
      </button>
      ${this.state.geoError ? `<button type="button" class="btn btn--ghost btn--block location-modal__demo" data-loc-action="demo">Continuar con la demo</button>` : ''}
      <div class="access-divider">o</div>
      <form class="location-form" novalidate>
        <div class="field">
          <div class="field__input-wrap">
            <svg class="field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" id="loc-city" class="field__input" placeholder="Introduce el nombre de la ciudad, distrito, calle…" autocomplete="off">
          </div>
          <p class="field__error" id="loc-city-error" hidden>En la demo hay eventos en Londres, Ámsterdam y París. Prueba con una de ellas.</p>
        </div>
        <button type="submit" class="btn btn--primary btn--block">Buscar</button>
      </form>
    `;
  },

  handleLocationClick(e) {
    const action = e.target.closest('[data-loc-action]')?.dataset.locAction;
    if (action === 'close') { this.closeLocationModal(); return; }
    if (action === 'geo') { this.requestGeoLocation(); return; }
    if (action === 'demo') { this.applyDemoGeo(); return; }
    const city = e.target.closest('[data-loc-city]')?.dataset.locCity;
    if (city) this.applyCity(city);
  },

  handleLocationSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('loc-city');
    const key = resolveCity(input ? input.value : '');
    if (!key) {
      document.getElementById('loc-city-error')?.removeAttribute('hidden');
      input?.classList.add('field__input--error');
      return;
    }
    this.applyCity(key);
  },

  requestGeoLocation() {
    if (!navigator.geolocation) { this.applyDemoGeo(); return; }
    this.state.geoLoading = true;
    this.state.geoError = false;
    this.renderLocationModal();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.state.geoLoading = false;
        this.state.search = {
          hasGeo: true,
          cityKey: 'geo',
          userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        };
        this.applyLocation();
      },
      () => {
        this.state.geoLoading = false;
        this.state.geoError = true;
        this.renderLocationModal();
      },
      { timeout: 8000 }
    );
  },

  applyDemoGeo() {
    this.state.geoLoading = false;
    this.state.geoError = false;
    this.state.search = { hasGeo: true, cityKey: 'geo', userLocation: { lat: 51.5074, lng: -0.1278 } };
    this.applyLocation();
  },

  applyCity(cityKey) {
    if (!CITIES[cityKey]) return;
    this.state.search = { hasGeo: false, cityKey, userLocation: null };
    this.applyLocation();
  },

  applyLocation() {
    this.invalidateVenues();
    this.state.geoError = false;
    this.updateLocationChip();
    this.closeLocationModal();
    if (this.state.screen === 'match-detail') this.renderMatchDetail();
  },

  /* ============================ Sitios (datos) ============================ */

  getVenuesForMatch(matchId) {
    const key = `${matchId}::${this.scenarioKey()}`;
    if (!this.state.venuesCache[key]) {
      const match = getMatchById(matchId);
      this.state.venuesCache[key] = match ? buildVenuesForMatch(match, this.getSearchContext()) : [];
    }
    return this.state.venuesCache[key];
  },

  getVenue(venueId) {
    return this.getVenuesForMatch(this.state.selectedMatchId).find((v) => v.id === venueId);
  },

  /* ============================ Estrellas ============================ */

  starsHtml(rating) {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    return `<span class="stars" role="img" aria-label="${rating} de 5">
      <span class="stars__off">★★★★★</span>
      <span class="stars__on" style="width:${pct}%">★★★★★</span>
    </span>`;
  },

  /* Nivel de ocupación de un sitio: 'full' | 'soon' | null (para urgencia) */
  venueUrgency(v) {
    if (v.reserved >= v.capacity) return 'full';
    const free = v.capacity - v.reserved;
    if (free <= 4 || v.reserved / v.capacity >= 0.85) return 'soon';
    return null;
  },

  /* ============================ Favoritos ============================ */

  loadFavorites() {
    try {
      const raw = window.localStorage.getItem('bb_favorites');
      this.state.favorites = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.state.favorites = [];
    }
  },

  saveFavorites() {
    try {
      window.localStorage.setItem('bb_favorites', JSON.stringify(this.state.favorites));
    } catch (e) { /* almacenamiento no disponible: se mantiene solo en memoria */ }
  },

  isFavorite(venueId) {
    return this.state.favorites.includes(venueId);
  },

  toggleFavorite(venueId) {
    const i = this.state.favorites.indexOf(venueId);
    if (i >= 0) this.state.favorites.splice(i, 1);
    else this.state.favorites.push(venueId);
    this.saveFavorites();
    // Refresca la vista actual para reflejar el cambio
    if (this.state.screen === 'match-detail') {
      this.renderMatchDetail();
    } else if (this.state.screen === 'venue-detail') {
      this.updateDetailFavButton(venueId);
    }
  },

  updateDetailFavButton(venueId) {
    const btn = document.getElementById('fav-toggle-detail');
    if (!btn) return;
    const fav = this.isFavorite(venueId);
    btn.classList.toggle('is-fav', fav);
    btn.setAttribute('aria-pressed', String(fav));
    btn.setAttribute('aria-label', fav ? 'Quitar de guardados' : 'Guardar este sitio');
  },

  /* ¿Este partido se puede ver en alguno de mis sitios guardados? (según ubicación) */
  matchHasFavoriteVenue(matchId) {
    if (!this.state.favorites.length) return false;
    return this.getVenuesForMatch(matchId).some((v) => this.isFavorite(v.id));
  },

  /* Icono estrella (relleno cuando es favorito) */
  starIcon() {
    return '<svg class="star-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.4 9.3l5.8-.8z"/></svg>';
  },

  /* ============================ Detalle de partido ============================ */

  openMatchDetail(matchId) {
    this.state.selectedMatchId = matchId;
    this.state.venueSort = 'distance';
    this.state.venueFilters = { spaceType: [], hideFull: false, minRating: 0 };
    this.state.venueFavOnly = false;
    this.renderMatchDetail();
    this.showScreen('match-detail');
    this.els['match-detail-content'].scrollTop = 0;
  },

  toggleFavOnly() {
    this.state.venueFavOnly = !this.state.venueFavOnly;
    this.renderMatchDetail();
  },

  venueFilterCount() {
    const f = this.state.venueFilters;
    return f.spaceType.length + (f.hideFull ? 1 : 0) + (f.minRating ? 1 : 0);
  },

  renderMatchDetail() {
    const match = getMatchById(this.state.selectedMatchId);
    if (!match) return;
    const comp = COMPETITIONS[match.competitionId].label;
    const teamTag = match.team === 'women' ? 'Femení' : 'Masculino';
    const datetime = formatMatchDatetime(match);
    const label = this.getSearchLabel();
    const isClosed = match.status === 'postponed' || match.status === 'cancelled';

    let statusBlock = '';
    if (match.status === 'postponed') {
      statusBlock = `<p class="alert alert--warning">${match.statusNote || 'Partido aplazado — nueva fecha por confirmar'}</p>`;
    } else if (match.status === 'cancelled') {
      statusBlock = `<p class="alert alert--danger">${match.statusNote || 'Partido cancelado'}</p>`;
    }

    const all = isClosed ? [] : this.getVenuesForMatch(match.id);
    const favInMatch = all.filter((v) => this.isFavorite(v.id));
    const hasFav = favInMatch.length > 0;
    if (!hasFav && this.state.venueFavOnly) this.state.venueFavOnly = false;

    let shown = isClosed ? [] : filterVenues(all, this.state.venueFilters);
    if (this.state.venueFavOnly) shown = shown.filter((v) => this.isFavorite(v.id));
    shown = sortVenues(shown, this.state.venueSort);
    // Los favoritos van primero (prioridad), manteniendo el orden elegido dentro de cada grupo
    if (hasFav && !this.state.venueFavOnly) {
      shown = [
        ...shown.filter((v) => this.isFavorite(v.id)),
        ...shown.filter((v) => !this.isFavorite(v.id)),
      ];
    }
    const activeCount = this.venueFilterCount();

    // Banner prioritario: este partido se ve en un sitio guardado
    const priorityBanner = hasFav ? `
      <div class="fav-priority">
        <div class="fav-priority__text">
          ${this.starIcon()}
          <span>Este partido se ve en <strong>${favInMatch.length}</strong> de tus sitios guardados</span>
        </div>
        <button type="button" class="fav-priority__toggle${this.state.venueFavOnly ? ' is-active' : ''}" data-fav-only>
          ${this.state.venueFavOnly ? 'Ver todos' : 'Solo favoritos'}
        </button>
      </div>
    ` : '';

    let venuesBlock;
    if (isClosed) {
      venuesBlock = `
        <div class="venues-empty">
          <p class="body-s">Cuando se confirme el partido, aquí verás los sitios para verlo en compañía.</p>
        </div>`;
    } else if (!all.length) {
      venuesBlock = `
        <div class="venues-empty">
          <p class="body-s">Todavía no hay sitios de la comunidad para este partido en ${label}. Prueba a cambiar de ubicación o vuelve pronto.</p>
        </div>`;
    } else if (!shown.length) {
      venuesBlock = `
        <div class="venues-empty">
          <p class="body-s">Ningún sitio coincide con estos filtros.</p>
          <button type="button" class="btn btn--ghost" data-clear-venue-filters style="margin-top:var(--space-3)">Quitar filtros</button>
        </div>`;
    } else {
      venuesBlock = `
        <div class="matches-list">
          ${shown.map((v) => this.venueCardHtml(v)).join('')}
        </div>`;
    }

    const toolbar = (!isClosed && all.length) ? `
      <div class="venue-toolbar">
        <button type="button" class="venue-toolbar__btn" data-open-venue-opts="sort">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h13M3 12h9M3 18h5M17 8V4m0 0-2 2m2-2 2 2"/></svg>
          ${VENUE_SORTS[this.state.venueSort]}
        </button>
        <button type="button" class="venue-toolbar__btn${activeCount ? ' is-active' : ''}" data-open-venue-opts="filters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18L14 14v5l-4 2v-7L3 5z"/></svg>
          Filtros${activeCount ? ` · ${activeCount}` : ''}
        </button>
      </div>
    ` : '';

    this.els['match-detail-content'].innerHTML = `
      <div class="match-detail__hero">
        <span class="match-detail__flag">${comp} · ${teamTag}</span>
        <div class="match-detail__teams">
          <div class="mdh-team">
            ${crestHtml(match.home, match.homeAbbr, 'barca', 'width:56px;height:56px;font-size:14px')}
            <span class="mdh-team__name">${match.home}</span>
          </div>
          <span class="match-detail__vs">VS</span>
          <div class="mdh-team">
            ${crestHtml(match.away, match.awayAbbr, 'rival', 'width:56px;height:56px;font-size:14px')}
            <span class="mdh-team__name">${match.away}</span>
          </div>
        </div>
        <div class="match-detail__datetime">${datetime}</div>
        <div class="match-detail__stadium">${match.round} · ${match.venue}</div>
      </div>
      ${statusBlock}
      <div class="venues-section">
        <div class="venues-section__head">
          <h2 class="home-section-title" style="margin:0">Dónde verlo</h2>
          <span class="venues-section__loc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/><circle cx="12" cy="9" r="2.5"/></svg>${label}</span>
        </div>
        ${priorityBanner}
        ${toolbar}
        ${venuesBlock}
      </div>
    `;
  },

  venueCardHtml(v) {
    const urgency = this.venueUrgency(v);
    const free = Math.max(0, v.capacity - v.reserved);
    const fav = this.isFavorite(v.id);
    const statusBadge =
      urgency === 'full'
        ? '<span class="venue-card__status venue-card__status--full">Completo</span>'
        : urgency === 'soon'
          ? '<span class="venue-card__status venue-card__status--soon">Últimas plazas</span>'
          : '';
    const capacityText =
      urgency === 'full'
        ? `${v.reserved}/${v.capacity} · completo`
        : urgency === 'soon'
          ? `Quedan ${free} plazas`
          : `${v.reserved}/${v.capacity} plazas`;
    return `
      <article class="event-card venue-card${fav ? ' is-fav' : ''}" data-venue-id="${v.id}" role="button" tabindex="0">
        <div class="venue-card__media venue-card__media--${v.category}">
          <img class="venue-card__img" src="${v.image}" alt="" loading="lazy" onerror="this.remove()">
          <span class="venue-badge venue-badge--${v.category} venue-card__badge">${SPACE_TYPE_LABELS[v.spaceType]}</span>
          ${statusBadge}
        </div>
        <div class="event-card__body">
          ${fav ? '<span class="venue-card__saved">' + this.starIcon() + ' Guardado</span>' : ''}
          <h3 class="event-card__name">${v.name}</h3>
          <div class="venue-card__rating">
            ${this.starsHtml(v.rating)}
            <span class="venue-card__rating-num">${v.rating.toFixed(1)}</span>
            <span class="venue-card__reviews">(${v.reviewCount})</span>
          </div>
          <p class="event-card__location">${v.location}</p>
          <div class="event-card__meta">
            <span class="event-card__distance">${formatDistance(v.distanceKm)}</span>
            <span class="event-card__capacity${urgency ? ` is-${urgency}` : ''}">${capacityText}</span>
          </div>
        </div>
      </article>
    `;
  },

  /* ============================ Ordenar / filtrar sitios ============================ */

  openVenueOpts(mode) {
    // Dos sheets diferenciados sobre el mismo contenedor: 'sort' u 'filters'
    this.state.venueOptsMode = mode === 'filters' ? 'filters' : 'sort';
    this.state.venueOptsDraft = {
      sort: this.state.venueSort,
      filters: {
        spaceType: [...this.state.venueFilters.spaceType],
        hideFull: this.state.venueFilters.hideFull,
        minRating: this.state.venueFilters.minRating,
      },
    };
    this.renderVenueOpts();
    this.els['venue-opts-overlay'].classList.add('is-open');
    this.els['venue-opts-sheet'].classList.add('is-open');
  },

  closeVenueOpts() {
    this.els['venue-opts-overlay'].classList.remove('is-open');
    this.els['venue-opts-sheet'].classList.remove('is-open');
  },

  renderVenueOpts() {
    const d = this.state.venueOptsDraft;

    // Sheet compacto de ordenación: elegir una opción aplica y cierra
    if (this.state.venueOptsMode === 'sort') {
      this.els['venue-opts-content'].innerHTML = `
        <div class="filter-sheet__header">
          <h2 class="filter-sheet__title" id="venue-opts-title">Ordenar por</h2>
        </div>

        <div class="sort-options" role="listbox" aria-label="Ordenar sitios por">
          ${Object.entries(VENUE_SORTS).map(([k, lbl]) => `
            <button type="button" class="sort-option${d.sort === k ? ' is-active' : ''}" data-sort="${k}" role="option" aria-selected="${d.sort === k}">
              <span>${lbl}</span>
              ${d.sort === k ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>' : ''}
            </button>
          `).join('')}
        </div>
      `;
      return;
    }

    const ratingChips = [
      { v: 0, l: 'Todas' }, { v: 3, l: '3+' }, { v: 4, l: '4+' }, { v: 4.5, l: '4,5+' },
    ];
    this.els['venue-opts-content'].innerHTML = `
      <div class="filter-sheet__header">
        <h2 class="filter-sheet__title" id="venue-opts-title">Filtrar sitios</h2>
        <button type="button" class="filter-sheet__clear" data-venue-opts-action="clear">Limpiar</button>
      </div>

      <div class="filter-group">
        <h3 class="filter-group__title">Disponibilidad</h3>
        <button type="button" class="opts-toggle${d.filters.hideFull ? ' is-active' : ''}" data-filter-full>
          <span class="opts-toggle__box" aria-hidden="true"></span>
          Ocultar sitios completos
        </button>
      </div>

      <div class="filter-group">
        <h3 class="filter-group__title">Tipo de espacio</h3>
        <div class="filter-chips">
          ${Object.entries(SPACE_TYPE_LABELS).map(([k, lbl]) => `
            <button type="button" class="filter-chip${d.filters.spaceType.includes(k) ? ' is-active' : ''}" data-space="${k}">${lbl}</button>
          `).join('')}
        </div>
      </div>

      <div class="filter-group">
        <h3 class="filter-group__title">Valoración mínima</h3>
        <div class="filter-chips">
          ${ratingChips.map((c) => `
            <button type="button" class="filter-chip${d.filters.minRating === c.v ? ' is-active' : ''}" data-minrating="${c.v}">${c.l}</button>
          `).join('')}
        </div>
      </div>

      <div class="filter-sheet__footer btn-group">
        <button type="button" class="btn btn--primary btn--block" data-venue-opts-action="apply">Ver sitios</button>
        <button type="button" class="btn btn--secondary btn--block" data-venue-opts-action="close">Cerrar</button>
      </div>
    `;
  },

  handleVenueOptsClick(e) {
    const d = this.state.venueOptsDraft;
    if (!d) return;
    const action = e.target.closest('[data-venue-opts-action]')?.dataset.venueOptsAction;
    if (action === 'close') { this.closeVenueOpts(); return; }
    if (action === 'apply') { this.applyVenueOpts(); return; }
    if (action === 'clear') {
      d.filters = { spaceType: [], hideFull: false, minRating: 0 };
      this.renderVenueOpts();
      return;
    }

    // En el sheet de ordenación, elegir una opción aplica y cierra directamente
    const sort = e.target.closest('[data-sort]')?.dataset.sort;
    if (sort) { d.sort = sort; this.applyVenueOpts(); return; }

    if (e.target.closest('[data-filter-full]')) {
      d.filters.hideFull = !d.filters.hideFull;
      this.renderVenueOpts();
      return;
    }

    const space = e.target.closest('[data-space]')?.dataset.space;
    if (space) {
      const i = d.filters.spaceType.indexOf(space);
      if (i >= 0) d.filters.spaceType.splice(i, 1);
      else d.filters.spaceType.push(space);
      this.renderVenueOpts();
      return;
    }

    const minr = e.target.closest('[data-minrating]')?.dataset.minrating;
    if (minr !== undefined) {
      d.filters.minRating = Number(minr);
      this.renderVenueOpts();
    }
  },

  applyVenueOpts() {
    const d = this.state.venueOptsDraft;
    this.state.venueSort = d.sort;
    this.state.venueFilters = d.filters;
    this.closeVenueOpts();
    this.renderMatchDetail();
  },

  clearVenueOpts(applyNow = false) {
    // Solo limpia filtros; la ordenación elegida se mantiene
    this.state.venueFilters = { spaceType: [], hideFull: false, minRating: 0 };
    if (applyNow) this.renderMatchDetail();
  },

  /* ============================ Detalle de sitio (estilo Maps) ============================ */

  openVenueDetail(venueId) {
    this.state.selectedVenueId = venueId;
    this.state.mapExpanded = false;
    const v = this.getVenue(venueId);
    if (!v) return;
    this.renderVenueDetail(v);
    this.showScreen('venue-detail');
    this.els['venue-detail-content'].scrollTop = 0;
    this.mountVenueMap(v);
  },

  mountVenueMap(v) {
    const mapEl = document.getElementById('venue-map');
    if (mapEl) {
      MapView.init(mapEl);
      MapView.showSingle(v, 15);
      MapView.setInteractive(false);
    }
  },

  renderVenueDetail(v) {
    const match = getMatchById(this.state.selectedMatchId);
    const free = Math.max(0, v.capacity - v.reserved);
    const full = free === 0;
    const urgency = this.venueUrgency(v);
    const fav = this.isFavorite(v.id);
    const datetime = match ? formatMatchDatetime(match) : '';

    this.els['venue-detail-content'].innerHTML = `
      <div class="venue-hero venue-hero--${v.category}">
        <img class="venue-hero__img" src="${v.image}" alt="" onerror="this.remove()">
        <div class="venue-hero__grad"></div>
        <span class="venue-badge venue-badge--${v.category} venue-hero__badge">${SPACE_TYPE_LABELS[v.spaceType]}</span>
      </div>

      <div class="venue-body">
        <div class="venue-detail__titlebar">
          <h1 class="venue-detail__name">${v.name}</h1>
          <button type="button" class="venue-name-fav${fav ? ' is-fav' : ''}" id="fav-toggle-detail" data-fav-toggle="${v.id}" aria-pressed="${fav}" aria-label="${fav ? 'Quitar de guardados' : 'Guardar este sitio'}">${this.starIcon()}</button>
        </div>
        <div class="venue-rating-row">
          ${this.starsHtml(v.rating)}
          <strong>${v.rating.toFixed(1)}</strong>
          <span>· ${v.reviewCount} reseñas</span>
        </div>
        <p class="venue-detail__addr">${v.location} · ${v.address}</p>

        ${urgency === 'soon' ? `<p class="alert alert--warning venue-urgency">¡Casi lleno! Quedan solo <strong>${free} plazas</strong>. Reserva ahora para asegurar tu sitio.</p>` : ''}
        ${urgency === 'full' ? `<p class="alert alert--danger venue-urgency">Este sitio está completo. Echa un vistazo a otros sitios cercanos.</p>` : ''}

        <div class="venue-actions">
          <button type="button" class="venue-action" data-map-action="expand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 20l-5.5 2.5V6L9 3.5m0 16.5 6-3m-6 3V3.5m6 13.5 5.5 2.5V6L15 3.5m0 13V3.5m0 0L9 6"/></svg>
            Cómo llegar
          </button>
          ${full
            ? `<button type="button" class="venue-action" disabled>Completo</button>`
            : `<button type="button" class="venue-action venue-action--primary" data-reserve-open="${v.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/></svg>
                Reservar
              </button>`}
        </div>

        <div class="venue-info-list">
          <div class="venue-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M16 3.5a3 3 0 0 1 0 5.5M21 20v-1a5 5 0 0 0-3-4.5"/></svg>
            <div><span>Aforo</span><strong class="${urgency ? `venue-aforo--${urgency}` : ''}">${v.reserved}/${v.capacity} · ${free} libres</strong></div>
          </div>
          ${match ? `
            <div class="venue-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v4l6 3"/></svg>
              <div><span>Partido</span><strong>${match.home} vs ${match.away}</strong></div>
            </div>
            <div class="venue-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <div><span>Fecha</span><strong>${datetime}</strong></div>
            </div>
          ` : ''}
          <div class="venue-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/><circle cx="12" cy="9" r="2.5"/></svg>
            <div><span>Distancia</span><strong>${formatDistance(v.distanceKm)} de ${this.getSearchLabel()}</strong></div>
          </div>
        </div>

        <div class="venue-map-wrap" id="venue-map-wrap">
          <div id="venue-map" class="venue-map"></div>
          <button type="button" class="venue-map__expand" data-map-action="expand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            Ampliar mapa
          </button>
          <button type="button" class="venue-map__close" data-map-action="collapse" hidden aria-label="Cerrar mapa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="venue-reviews">
          <div class="venue-reviews__head">
            <h2 class="home-section-title" style="margin:0">Reseñas</h2>
            <div class="venue-reviews__score">
              ${this.starsHtml(v.rating)}
              <strong>${v.rating.toFixed(1)}</strong>
            </div>
          </div>
          ${v.reviews.map((r) => `
            <div class="review">
              <div class="review__avatar review__avatar--${v.category}">${r.initials}</div>
              <div class="review__body">
                <div class="review__top">
                  <strong>${r.name}</strong>
                  <span>${r.date}</span>
                </div>
                <div class="review__stars">${this.starsHtml(r.rating)}</div>
                <p class="review__text">${r.text}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="venue-detail__cta">
          <p class="venue-detail__as">Reservando como <strong>${this.state.authUser.firstName} ${this.state.authUser.lastName}</strong></p>
          ${full
            ? `<button class="btn btn--block" disabled style="background: var(--interactive-primary-disabled); color: var(--content-disabled)">Sitio completo</button>`
            : `<button class="btn btn--primary btn--block" data-reserve-open="${v.id}">Reservar plaza</button>`}
        </div>
      </div>
    `;
  },

  expandMap() {
    const wrap = document.getElementById('venue-map-wrap');
    if (!wrap) return;
    wrap.classList.add('is-expanded');
    wrap.querySelector('.venue-map__expand').hidden = true;
    wrap.querySelector('.venue-map__close').hidden = false;
    this.state.mapExpanded = true;
    MapView.setInteractive(true);
    MapView.invalidateSize();
    this.els['mini-nav'].classList.add('is-hidden');
  },

  collapseMap() {
    const wrap = document.getElementById('venue-map-wrap');
    if (wrap) {
      wrap.classList.remove('is-expanded');
      wrap.querySelector('.venue-map__expand').hidden = false;
      wrap.querySelector('.venue-map__close').hidden = true;
    }
    this.state.mapExpanded = false;
    MapView.setInteractive(false);
    MapView.invalidateSize();
    this.els['mini-nav'].classList.remove('is-hidden');
  },

  /* ============================ Reserva ============================ */

  openReserve(venueId) {
    this.state.reserveVenueId = venueId;
    this.state.reservePlazas = 1;
    this.renderReserve();
    this.els['reserve-overlay'].classList.add('is-open');
    this.els['reserve-sheet'].classList.add('is-open');
  },

  closeReserve() {
    this.els['reserve-overlay'].classList.remove('is-open');
    this.els['reserve-sheet'].classList.remove('is-open');
  },

  renderReserve() {
    const v = this.getVenue(this.state.reserveVenueId);
    const match = getMatchById(this.state.selectedMatchId);
    if (!v) return;
    const free = Math.max(0, v.capacity - v.reserved);
    const plazas = this.state.reservePlazas;
    const datetime = match ? formatMatchDatetime(match) : '';

    this.els['reserve-content'].innerHTML = `
      <div class="access-sheet__header">
        <div>
          <p class="access-sheet__overline">Reserva</p>
          <h2 class="access-sheet__title" id="reserve-title">${v.name}</h2>
        </div>
        <button type="button" class="access-sheet__close" data-reserve-action="close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      ${match ? `
        <div class="reserve-match">
          ${crestHtml(match.home, match.homeAbbr, 'barca')}
          <div class="reserve-match__txt">
            <strong>${match.home} vs ${match.away}</strong>
            <span>${datetime} · ${v.location}</span>
          </div>
          ${crestHtml(match.away, match.awayAbbr, 'rival')}
        </div>
      ` : ''}

      <div class="reserve-stepper">
        <div>
          <span class="reserve-stepper__label">Personas</span>
          <span class="reserve-stepper__hint">${free} plaza${free !== 1 ? 's' : ''} libre${free !== 1 ? 's' : ''}</span>
        </div>
        <div class="reserve-stepper__control">
          <button type="button" class="reserve-stepper__btn" data-reserve-action="dec" ${plazas <= 1 ? 'disabled' : ''} aria-label="Menos personas">−</button>
          <span class="reserve-stepper__value" id="reserve-plazas">${plazas}</span>
          <button type="button" class="reserve-stepper__btn" data-reserve-action="inc" ${plazas >= free ? 'disabled' : ''} aria-label="Más personas">+</button>
        </div>
      </div>

      <button type="button" class="btn btn--primary btn--block reserve-confirm" data-reserve-action="confirm">
        Confirmar ${plazas} plaza${plazas !== 1 ? 's' : ''}
      </button>
      <p class="reserve-note">A nombre de ${this.state.authUser.firstName} ${this.state.authUser.lastName}</p>
    `;
  },

  handleReserveClick(e) {
    const action = e.target.closest('[data-reserve-action]')?.dataset.reserveAction;
    if (!action) return;
    const v = this.getVenue(this.state.reserveVenueId);
    if (!v) return;
    const free = Math.max(0, v.capacity - v.reserved);

    if (action === 'close') { this.closeReserve(); return; }
    if (action === 'dec') {
      this.state.reservePlazas = Math.max(1, this.state.reservePlazas - 1);
      this.renderReserve();
      return;
    }
    if (action === 'inc') {
      this.state.reservePlazas = Math.min(free, this.state.reservePlazas + 1);
      this.renderReserve();
      return;
    }
    if (action === 'confirm') { this.confirmReserve(); }
  },

  confirmReserve() {
    const v = this.getVenue(this.state.reserveVenueId);
    const match = getMatchById(this.state.selectedMatchId);
    if (!v || !match) return;
    const plazas = this.state.reservePlazas;

    v.reserved = Math.min(v.capacity, v.reserved + plazas);

    const d = parseDate(match.date);
    const ticket = {
      id: `t-${Date.now()}-${this.state.ticketSeq++}`,
      code: generateTicketCode(),
      matchId: match.id,
      home: match.home,
      away: match.away,
      homeAbbr: match.homeAbbr,
      awayAbbr: match.awayAbbr,
      comp: COMPETITIONS[match.competitionId].label,
      dateLabel: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
      timeLabel: match.time || 'Por confirmar',
      venueName: v.name,
      venueLocation: v.location,
      category: v.category,
      plazas,
      holder: `${this.state.authUser.firstName} ${this.state.authUser.lastName}`,
    };

    this.state.tickets.unshift(ticket);
    this.updateTicketsBadge();
    this.closeReserve();
    this.showTicket(ticket, { animate: true });

    this.renderVenueDetail(v);
    this.mountVenueMap(v);
  },

  /* ============================ Ticket (entrada de estadio) ============================ */

  ticketHtml(t) {
    return `
      <div class="ticket ticket--${t.category}">
        <div class="ticket__main">
          <div class="ticket__brand-row">
            <span class="ticket__brand">Barça Buddies</span>
            <span class="ticket__comp">${t.comp}</span>
          </div>
          <div class="ticket__teams">
            ${crestHtml(t.home, t.homeAbbr, 'barca', 'width:38px;height:38px;font-size:12px')}
            <span class="ticket__vs">VS</span>
            ${crestHtml(t.away, t.awayAbbr, 'rival', 'width:38px;height:38px;font-size:12px')}
          </div>
          <div class="ticket__match">${t.home} · ${t.away}</div>
          <div class="ticket__grid">
            <div><span>Fecha</span><strong>${t.dateLabel}</strong></div>
            <div><span>Hora</span><strong>${t.timeLabel}</strong></div>
            <div class="ticket__grid-wide"><span>Sitio</span><strong>${t.venueName}</strong></div>
          </div>
          <div class="ticket__holder">A nombre de ${t.holder}</div>
        </div>
        <div class="ticket__stub" aria-hidden="false">
          <span class="ticket__stub-label">Plazas</span>
          <span class="ticket__stub-plazas">${t.plazas}</span>
          <span class="ticket__code">${t.code}</span>
          <div class="ticket__barcode"></div>
        </div>
      </div>
    `;
  },

  showTicket(t, { animate = true } = {}) {
    this.els['ticket-stage'].innerHTML = `
      <div class="ticket-result${animate ? ' is-animating' : ''}">
        <div class="ticket-result__seal" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h2 class="ticket-result__title">${animate ? '¡Plaza reservada!' : 'Tu entrada'}</h2>
        <p class="ticket-result__sub">Guárdala — es tu entrada para ver el partido en compañía.</p>
        ${this.ticketHtml(t)}
        <div class="ticket-actions">
          <button type="button" class="btn btn--primary btn--block" data-ticket-action="tickets">Ver en Mis entradas</button>
          <button type="button" class="btn btn--ghost btn--block" data-ticket-action="done">Hecho</button>
        </div>
      </div>
    `;
    this.els['ticket-overlay'].classList.add('is-open');
    this.els['ticket-overlay'].setAttribute('aria-hidden', 'false');
  },

  closeTicket() {
    this.els['ticket-overlay'].classList.remove('is-open');
    this.els['ticket-overlay'].setAttribute('aria-hidden', 'true');
  },

  /* ============================ Mis entradas ============================ */

  /* Tarjeta de perfil al inicio de Mis entradas (abre el sheet de perfil) */
  profileCardHtml() {
    const u = this.state.authUser;
    return `
      <button type="button" class="profile-card" data-open-profile>
        <span class="profile-card__avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
        </span>
        <span class="profile-card__text">
          <strong class="profile-card__name">${u.firstName} ${u.lastName}</strong>
          <span class="profile-card__meta">${u.area} · ${u.city}</span>
        </span>
        <svg class="profile-card__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    `;
  },

  renderTickets() {
    const content = this.els['tickets-content'];
    if (!this.state.tickets.length) {
      content.innerHTML = `
        ${this.profileCardHtml()}
        <div class="tickets-empty">
          <div class="tickets-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M15 6v12"/></svg>
          </div>
          <h2 class="heading-s">Aún no tienes entradas</h2>
          <p class="body-s">Elige un partido y reserva tu plaza para verlo en compañía.</p>
          <button type="button" class="btn btn--primary btn--block" data-go-home>Explorar partidos</button>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      ${this.profileCardHtml()}
      <div class="tickets-list">
        ${this.state.tickets.map((t) => `
          <article class="ticket-mini ticket-mini--${t.category}" data-ticket-id="${t.id}" role="button" tabindex="0">
            <div class="ticket-mini__main">
              <span class="ticket-mini__comp">${t.comp}</span>
              <span class="ticket-mini__match">${t.home} vs ${t.away}</span>
              <span class="ticket-mini__meta">${t.dateLabel} · ${t.timeLabel} · ${t.venueName}</span>
            </div>
            <div class="ticket-mini__stub">
              <span class="ticket-mini__plazas">${t.plazas}</span>
              <span class="ticket-mini__plazas-label">plaza${t.plazas !== 1 ? 's' : ''}</span>
              <span class="ticket-mini__code">${t.code}</span>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  },

  updateTicketsBadge() {
    const badge = this.els['tickets-badge'];
    const n = this.state.tickets.length;
    badge.textContent = n;
    badge.hidden = n === 0;
  },

  /* ============================ Perfil (demo) ============================ */

  openProfile() {
    const u = this.state.authUser;
    this.els['profile-content'].innerHTML = `
      <div class="access-sheet__header">
        <div>
          <p class="access-sheet__overline">Sesión iniciada</p>
          <h2 class="access-sheet__title" id="profile-title">${u.firstName} ${u.lastName}</h2>
        </div>
        <button type="button" class="access-sheet__close" data-profile-action="close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <p class="access-sheet__context">${u.email}<br>${u.area}, ${u.city}</p>
      <div class="profile-stats">
        <div><strong>${this.state.tickets.length}</strong><span>entradas</span></div>
      </div>
      <p class="alert alert--info">En la demo, la sesión se asume iniciada. El registro y la gestión de cuenta llegarán más adelante.</p>
      <button type="button" class="btn btn--ghost btn--block" data-profile-action="close">Cerrar</button>
    `;
    this.els['profile-overlay'].classList.add('is-open');
    this.els['profile-sheet'].classList.add('is-open');
  },

  closeProfile() {
    this.els['profile-overlay'].classList.remove('is-open');
    this.els['profile-sheet'].classList.remove('is-open');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  Home.init();
});
