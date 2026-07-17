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

  /* ── Ruta origen → sitio (Cómo llegar) ── */

  routeLayers: [],

  clearRoute() {
    if (!this.map) return;
    this.routeLayers.forEach((l) => this.map.removeLayer(l));
    this.routeLayers = [];
  },

  /**
   * Dibuja la ruta más rápida desde el origen de búsqueda hasta el sitio.
   * Usa OSRM público; si falla o tarda, cae a una línea recta discontinua.
   * @returns {Promise<{distanceKm:number, durationMin:number|null, approx:boolean}>}
   */
  async showRoute(origin, dest) {
    if (!this.map) return null;
    this.clearRoute();

    const originMarker = L.circleMarker([origin.lat, origin.lng], {
      radius: 8,
      fillColor: '#0a5ba3',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1,
    }).addTo(this.map);
    this.routeLayers.push(originMarker);

    const drawLine = (coords, dashed) => {
      // Halo claro debajo para que la ruta se lea sobre cualquier tile
      const halo = L.polyline(coords, { color: '#ffffff', weight: 8, opacity: 0.85 }).addTo(this.map);
      const line = L.polyline(coords, {
        color: '#0a5ba3',
        weight: 4,
        opacity: 0.95,
        dashArray: dashed ? '8 8' : null,
      }).addTo(this.map);
      this.routeLayers.push(halo, line);
      this.map.fitBounds(line.getBounds().pad(0.2), { animate: true });
    };

    const fallback = () => {
      drawLine([[origin.lat, origin.lng], [dest.lat, dest.lng]], true);
      const km = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
      return { distanceKm: km, durationMin: null, approx: true };
    };

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route) return fallback();
      drawLine(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), false);
      return {
        distanceKm: route.distance / 1000,
        durationMin: Math.max(1, Math.round(route.duration / 60)),
        approx: false,
      };
    } catch (e) {
      return fallback();
    }
  },
};
