/* Mapa real con Leaflet + Carto Voyager (estilo limpio, sin API key) */

const MapView = {
  map: null,
  tileLayer: null,
  markerLayer: null,
  userMarker: null,
  container: null,
  ready: false,
  shouldFit: false,

  init(containerEl) {
    this.container = containerEl;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(containerEl, {
      zoomControl: false,
      attributionControl: true,
    });

    this.tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }
    ).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    this.ready = true;

    return this;
  },

  show(center, zoom, hasGeo) {
    if (!this.map) return;

    this.map.setView([center.lat, center.lng], zoom, { animate: false });

    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
      this.userMarker = null;
    }

    if (hasGeo) {
      this.userMarker = L.circleMarker([center.lat, center.lng], {
        radius: 9,
        fillColor: '#0a5ba3',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      }).addTo(this.map);
    }

    this.shouldFit = true;
    this.invalidateSize();
  },

  _createIcon(event, selected) {
    const dist =
      event.distanceKm !== undefined ? formatDistance(event.distanceKm) : '';

    return L.divIcon({
      className: `leaflet-pin-wrap${selected ? ' is-selected' : ''}`,
      html: `
        <button type="button" class="map-pin leaflet-pin" aria-label="${event.name}">
          <span class="map-pin__marker" aria-hidden="true">
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
              <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" class="map-pin__shape"/>
              <circle cx="14" cy="14" r="5" fill="white"/>
            </svg>
          </span>
          <span class="map-pin__label">${event.name}</span>
          ${dist ? `<span class="map-pin__distance">${dist}</span>` : ''}
        </button>
      `,
      iconSize: [130, 70],
      iconAnchor: [65, 36],
    });
  },

  renderPins(events, selectedId, onPinClick) {
    if (!this.markerLayer) return;

    this.markerLayer.clearLayers();

    events.forEach((event) => {
      const marker = L.marker([event.lat, event.lng], {
        icon: this._createIcon(event, event.id === selectedId),
        zIndexOffset: event.id === selectedId ? 1000 : 0,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onPinClick(event);
      });

      this.markerLayer.addLayer(marker);
    });

    if (this.shouldFit && events.length > 0) {
      const bounds = L.latLngBounds(events.map((e) => [e.lat, e.lng]));
      if (this.userMarker) {
        bounds.extend(this.userMarker.getLatLng());
      }
      if (events.length === 1) {
        this.map.setView(bounds.getCenter(), this.map.getZoom());
      } else {
        this.map.fitBounds(bounds.pad(0.3), { maxZoom: 15, animate: false });
      }
      this.shouldFit = false;
    }
  },

  setZoomForRadius(radiusKm) {
    if (!this.map) return;
    let zoom;
    if (radiusKm <= 1)       zoom = 15;
    else if (radiusKm <= 2)  zoom = 14;
    else if (radiusKm <= 5)  zoom = 13;
    else if (radiusKm <= 8)  zoom = 12;
    else if (radiusKm <= 12) zoom = 11;
    else if (radiusKm <= 20) zoom = 10;
    else                     zoom = 9;
    this.map.setView(this.map.getCenter(), zoom, { animate: true });
  },

  invalidateSize() {
    if (!this.map) return;
    requestAnimationFrame(() => {
      this.map.invalidateSize();
    });
  },

  /* Activa/desactiva las interacciones — thumbnail (off) vs mapa expandido (on) */
  setInteractive(on) {
    if (!this.map) return;
    const handlers = [
      'dragging', 'touchZoom', 'doubleClickZoom',
      'scrollWheelZoom', 'boxZoom', 'keyboard',
    ];
    handlers.forEach((h) => {
      if (this.map[h]) this.map[h][on ? 'enable' : 'disable']();
    });
    const zoomCtrl = this.container?.querySelector('.leaflet-control-zoom');
    if (zoomCtrl) zoomCtrl.style.display = on ? '' : 'none';
  },

  /* Coloca un único marcador (detalle de sitio) y centra en él */
  showSingle(venue, zoom = 15) {
    if (!this.map || !venue) return;
    this.map.setView([venue.lat, venue.lng], zoom, { animate: false });
    this.shouldFit = false;
    if (this.markerLayer) this.markerLayer.clearLayers();
    const marker = L.marker([venue.lat, venue.lng], {
      icon: this._createIcon(venue, true),
    });
    this.markerLayer.addLayer(marker);
    this.invalidateSize();
  },

  onMapClick(callback) {
    if (!this.map) return;
    this.map.off('click');
    this.map.on('click', callback);
  },
};
