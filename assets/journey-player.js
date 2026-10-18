(() => {
  "use strict";

  const MOVE_MS = 1400;
  const READ_MS = 2200;
  const text = (value, language) => typeof value === "string" ? value : value?.[language] || value?.en || "";
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Map data: HTTP ${response.status}`);
    return response.json();
  }
  function unwrapRing(ring) {
    let previous = ring[0][0];
    return ring.map(([longitude, latitude]) => {
      while (longitude - previous > 180) longitude -= 360;
      while (longitude - previous < -180) longitude += 360;
      previous = longitude;
      return [longitude, latitude];
    });
  }

  // A great-circle path split at the date line, including Pacific crossings.
  function connection(start, end) {
    const radians = Math.PI / 180;
    const vector = ([lat, lng]) => [Math.cos(lat * radians) * Math.cos(lng * radians),
      Math.cos(lat * radians) * Math.sin(lng * radians), Math.sin(lat * radians)];
    const a = vector(start), b = vector(end);
    const angle = Math.acos(Math.max(-1, Math.min(1, a.reduce((sum, value, i) => sum + value * b[i], 0))));
    if (Math.abs(Math.sin(angle)) < 1e-8) return [[start, end]];
    const segments = [[]];
    let previous;
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const left = Math.sin((1 - t) * angle) / Math.sin(angle);
      const right = Math.sin(t * angle) / Math.sin(angle);
      const [x, y, z] = a.map((value, index) => left * value + right * b[index]);
      const point = [Math.atan2(z, Math.hypot(x, y)) / radians, Math.atan2(y, x) / radians];
      if (previous && Math.abs(point[1] - previous[1]) > 180) {
        const boundary = previous[1] > 0 ? 180 : -180;
        const longitude = point[1] + (boundary === 180 ? 360 : -360);
        const fraction = (boundary - previous[1]) / (longitude - previous[1]);
        const latitude = previous[0] + fraction * (point[0] - previous[0]);
        segments[segments.length - 1].push([latitude, boundary]);
        segments.push([[latitude, -boundary]]);
      }
      segments[segments.length - 1].push(point);
      previous = point;
    }
    return segments;
  }

  function pathAt(segments, progress) {
    const total = segments.reduce((sum, part) => sum + part.length - 1, 0);
    let remaining = Math.max(0, Math.min(1, progress)) * total;
    const visible = [];
    for (const part of segments) {
      if (remaining >= part.length - 1) {
        visible.push(part);
        remaining -= part.length - 1;
      } else {
        const index = Math.min(part.length - 2, Math.floor(remaining));
        const a = part[index], b = part[index + 1];
        const fraction = remaining - index;
        const point = a.map((value, axis) => value + fraction * (b[axis] - value));
        visible.push([...part.slice(0, index + 1), point]);
        return { visible, point, a, b };
      }
    }
    const last = segments[segments.length - 1];
    return { visible, point: last[last.length - 1], a: last[last.length - 2], b: last[last.length - 1] };
  }

  function pin(id, title) {
    const body = element("div", "map-pin");
    body.dataset.placeId = id;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 28 38");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = '<path d="M14 1.5C7.1 1.5 1.5 7 1.5 13.8C1.5 23.2 14 36.5 14 36.5S26.5 23.2 26.5 13.8C26.5 7 20.9 1.5 14 1.5Z"/><circle cx="14" cy="13.5" r="4"/>';
    body.append(svg, element("span", "map-sr-only", title));
    return body;
  }
  function flowIcon() {
    const body = element("div", "flow-mark");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = '<path class="flow-direction" d="M29 16L18 10L18 22Z"/><text class="flow-number" text-anchor="middle"></text>';
    body.append(svg, element("span", "map-sr-only"));
    return body;
  }

  async function initialize(section) {
    const labels = JSON.parse(section.dataset.labels);
    const language = section.dataset.language;
    const ui = section.querySelector("[data-map-ui]");
    const container = section.querySelector("[data-map-container]");
    const status = section.querySelector("[data-map-status]");
    const timeline = section.querySelector(".journey-details");
    const slider = section.querySelector("[data-player-slider]");
    const playButton = section.querySelector("[data-player-play]");
    const previousButton = section.querySelector("[data-player-previous]");
    const nextButton = section.querySelector("[data-player-next]");
    const counter = section.querySelector("[data-player-count]");
    const card = section.querySelector("[data-player-card]");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let map, timer, frame, flight, popupRestore;
    let step = 0;
    let playing = false;
    timeline.open = false;
    status.hidden = false;
    status.textContent = labels.loading;

    try {
      if (!window.L || !window.topojson) throw new Error("Map libraries unavailable");
      const [world, data] = await Promise.all([
        loadJSON(section.dataset.worldUrl), loadJSON(section.dataset.placesUrl), document.fonts.ready,
      ]);
      const stops = data.stops.map((stop, index) => {
        const points = (stop.locations || []).filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 85 && Math.abs(point.lng) <= 180)
          .map(point => [point.lat, point.lng]);
        if (!points.length) throw new Error("A chapter has no valid coordinates");
        const anchor = [0, 1].map(axis => points.reduce((sum, point) => sum + point[axis], 0) / points.length);
        return { ...stop, number: index + 1, anchor };
      });
      if (!stops.length) throw new Error("The journey has no chapters");
      // Use the same rendered card in the timeline, player, and map popups.
      const chapterTemplates = stops.map(chapter => {
        const template = section.querySelector(`[data-stop-number="${chapter.number}"] [data-chapter-content]`);
        if (!template) throw new Error("A chapter card is missing");
        return template.cloneNode(true);
      });
      const places = data.places.filter(place => Number.isFinite(place.lat) && Number.isFinite(place.lng));
      ui.hidden = false;
      map = L.map(container, { minZoom: 0, maxZoom: 10, zoomSnap: 0.25,
        zoomControl: false, scrollWheelZoom: false, zoomAnimation: !reduceMotion, fadeAnimation: !reduceMotion,
        maxBounds: [[-85, -210], [85, 210]], maxBoundsViscosity: 0.8 }).setView([30, 0], 1);
      map.createPane("flowPane").style.zIndex = "580";
      L.control.zoom({ position: "bottomleft", zoomInTitle: labels.zoom_in, zoomOutTitle: labels.zoom_out }).addTo(map);
      map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
      map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/">Natural Earth</a>');
      const geography = topojson.feature(world, world.objects.countries);
      geography.features.forEach(feature => {
        if (feature.geometry.type === "Polygon") feature.geometry.coordinates = feature.geometry.coordinates.map(unwrapRing);
        if (feature.geometry.type === "MultiPolygon") feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => polygon.map(unwrapRing));
      });
      L.geoJSON(geography, { filter: feature => feature.properties.name !== "Antarctica", interactive: false,
        style: { color: "#f8faf7", weight: 0.7, fillColor: "#dfe6df", fillOpacity: 1 } }).addTo(map);
      map.getPane("overlayPane").setAttribute("aria-hidden", "true");
      const overview = L.layerGroup();
      const scene = L.layerGroup().addTo(map);
      const overviewBounds = L.latLngBounds(places.map(place => [place.lat, place.lng]));
      const overviewPins = [];

      function tooltip(name, annotation) {
        const node = element("span", "place-label-content");
        node.append(element("span", "place-label-name", name));
        if (annotation) node.append(element("span", "place-label-status", annotation));
        return node;
      }
      function makeMarker(position, id, title, current, origin = false) {
        return L.marker(position, { title, keyboard: true,
          icon: L.divIcon({ html: pin(id, title), className: `journey-pin${current ? " journey-pin-current" : ""}${origin ? " journey-origin-pin" : ""}`,
            iconSize: [22, 30], iconAnchor: [11, 29], popupAnchor: [0, -27], tooltipAnchor: [0, -14] }) });
      }
      places.forEach(place => {
        const visits = stops.filter(stop => stop.map_id === place.id);
        if (!visits.length) return;
        const latest = visits.find(stop => stop.current);
        const name = text(place.label || place.name, language);
        const marker = makeMarker([place.lat, place.lng], place.id, text(place.name, language), Boolean(latest));
        marker.bindTooltip(tooltip(name, latest ? labels.now : visits[0].number === 1 ? labels.started : ""), {
          permanent: true, direction: place.label_side || "top", offset: L.point(place.label_offset || [0, 0]),
          className: "journey-place-label", opacity: 1,
        });
        marker.on("click", () => { pause(); showStep((latest || visits[0]).number, true); });
        overview.addLayer(marker);
        let leader;
        if ((place.pin_offset || []).some(value => value !== 0)) {
          leader = L.polyline([[place.lat, place.lng], [place.lat, place.lng]], { color: "#668f92", weight: 1, interactive: false }).addTo(overview);
          L.circleMarker([place.lat, place.lng], { radius: 2.5, color: "#668f92", weight: 1, fillOpacity: 1, interactive: false }).addTo(overview);
        }
        overviewPins.push({ place, marker, leader });
      });

      const flow = flowIcon();
      const direction = L.marker([0, 0], { pane: "flowPane", keyboard: true,
        icon: L.divIcon({ html: flow, className: "journey-flow", iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -13] }) });

      function chapterPopup(chapter) {
        const content = element("div", "place-popup");
        content.append(element("p", "place-popup-number", `${labels.stop} ${chapter.number}`));
        content.append(chapterTemplates[chapter.number - 1].cloneNode(true));
        return content;
      }
      function bindChapter(marker, chapter) {
        marker.bindPopup(() => chapterPopup(chapter), {
          maxWidth: Math.min(270, container.clientWidth - 70),
          maxHeight: Math.max(100, container.clientHeight - 80),
          autoPanPadding: [14, 14],
        });
      }
      map.on("popupopen", event => {
        pause();
        const node = event.popup.getElement();
        node.setAttribute("role", "dialog");
        node.setAttribute("aria-label", node.querySelector("h3")?.textContent || labels.label);
        const close = node.querySelector(".leaflet-popup-close-button");
        close.setAttribute("aria-label", labels.close);
        close.title = labels.close;
        // At a wide zoom, the world's northern bound can leave too little
        // room above a marker for auto-pan. Focus just enough to fit the card.
        const anchor = event.popup.getLatLng();
        const north = L.latLngBounds(map.options.maxBounds).getNorth();
        const available = map.project(anchor).y - map.project([north, anchor.lng]).y;
        const needed = node.offsetHeight + 80;
        if (available < needed && map.getZoom() < map.getMaxZoom()) {
          popupRestore = { center: map.getCenter(), zoom: map.getZoom() };
          const zoom = Math.min(map.getMaxZoom(), Math.ceil((map.getZoom() + Math.log2(needed / Math.max(1, available))) * 4) / 4 + 0.25);
          map.stop();
          map.setView(anchor, zoom, { animate: false });
          event.popup.update();
        }
        const scrolling = node.querySelector(".leaflet-popup-scrolled");
        if (scrolling) scrolling.tabIndex = 0;
      });
      map.on("popupclose", () => {
        if (!popupRestore) return;
        const view = popupRestore;
        popupRestore = null;
        map.stop();
        map.setView(view.center, view.zoom, { animate: false });
      });

      function updateControls() {
        slider.value = String(step);
        slider.max = String(stops.length);
        slider.setAttribute("aria-valuetext", step ? `${step} / ${stops.length}: ${text(stops[step - 1].title, language)} · ${text(stops[step - 1].context, language)}` : labels.overview);
        counter.textContent = step ? `${step} / ${stops.length}` : labels.overview;
        previousButton.disabled = step === 0;
        nextButton.disabled = step === stops.length;
        section.querySelector("[data-player-icon]").textContent = playing ? "Ⅱ" : "▶";
        section.querySelector("[data-player-play-label]").textContent = playing ? labels.pause : step === stops.length && (!flight || flight.progress >= 1) ? labels.replay : labels.play;
        section.dataset.playing = String(playing);
        section.dataset.journeyStep = String(step);
      }
      function cancelTiming() {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
        timer = frame = null;
      }
      function pause() {
        playing = false;
        cancelTiming();
        updateControls();
      }
      function scheduleNext() {
        clearTimeout(timer);
        if (!playing) return;
        if (step >= stops.length) { pause(); return; }
        timer = setTimeout(() => showStep(step + 1, true), READ_MS);
      }
      function drawProgress(progress) {
        if (!flight) return;
        const current = pathAt(flight.segments, progress);
        flight.line.setLatLngs(current.visible);
        flight.dot.setLatLng(current.point);
      }
      function runFlight() {
        if (!flight || flight.progress >= 1) { scheduleNext(); return; }
        cancelAnimationFrame(frame);
        const active = flight;
        const start = performance.now() - active.progress * MOVE_MS;
        const tick = now => {
          if (flight !== active) return;
          active.progress = Math.min(1, (now - start) / MOVE_MS);
          drawProgress((1 - Math.cos(Math.PI * active.progress)) / 2);
          if (active.progress < 1) frame = requestAnimationFrame(tick);
          else {
            scene.removeLayer(active.dot);
            frame = null;
            if (playing && step === stops.length) pause();
            else { updateControls(); scheduleNext(); }
          }
        };
        frame = requestAnimationFrame(tick);
      }

      function positionGeometry() {
        if (step === 0) {
          overviewPins.forEach(({ place, marker, leader }) => {
            if (!leader) return;
            const anchor = [place.lat, place.lng];
            const point = map.latLngToContainerPoint(anchor).add(L.point(place.pin_offset));
            const position = map.containerPointToLatLng(point);
            if (!marker.getLatLng().equals(position, 1e-8)) marker.setLatLng(position);
            leader.setLatLngs([anchor, position]);
          });
          return;
        }
        if (!flight || !map.hasLayer(direction)) return;
        const rect = container.getBoundingClientRect();
        const boxes = [...container.querySelectorAll(".journey-pin, .journey-place-label, .leaflet-control")].map(node => {
          const box = node.getBoundingClientRect();
          return { left: box.left - rect.left - 3, right: box.right - rect.left + 3,
            top: box.top - rect.top - 3, bottom: box.bottom - rect.top + 3 };
        });
        const fractions = direction.isPopupOpen() && flight.arrowFraction ? [flight.arrowFraction] : [0.5, 0.65, 0.35, 0.75, 0.25];
        let best;
        for (const fraction of fractions) {
          const sample = pathAt(flight.segments, fraction);
          const point = map.latLngToContainerPoint(sample.point);
          let score = (Math.max(0, 18 - point.x) + Math.max(0, point.x - container.clientWidth + 18) +
            Math.max(0, 18 - point.y) + Math.max(0, point.y - container.clientHeight + 18)) * 1000;
          boxes.forEach(box => { score += Math.max(0, Math.min(point.x + 14, box.right) - Math.max(point.x - 14, box.left)) *
            Math.max(0, Math.min(point.y + 14, box.bottom) - Math.max(point.y - 14, box.top)); });
          if (!best || score < best.score) best = { ...sample, fraction, score };
        }
        flight.arrowFraction = best.fraction;
        if (!direction.getLatLng().equals(best.point, 1e-8)) direction.setLatLng(best.point);
        const delta = map.project(best.b).subtract(map.project(best.a));
        const length = Math.hypot(delta.x, delta.y) || 1;
        flow.querySelector(".flow-direction").setAttribute("transform", `rotate(${Math.atan2(delta.y, delta.x) * 180 / Math.PI} 16 16)`);
        flow.querySelector(".flow-number").setAttribute("x", String(16 - delta.x / length * 7));
        flow.querySelector(".flow-number").setAttribute("y", String(19.5 - delta.y / length * 7));
      }

      function showOverview() {
        pause();
        flight = null;
        step = 0;
        map.closePopup();
        scene.clearLayers();
        overview.addTo(map);
        card.hidden = true;
        status.hidden = true;
        section.querySelectorAll(".journey-list .is-selected").forEach(row => row.classList.remove("is-selected"));
        map.fitBounds(overviewBounds, { padding: [45, 55], maxZoom: 2.5, animate: false });
        positionGeometry();
        updateControls();
      }
      function showStep(number, animate) {
        cancelTiming();
        if (number <= 0) { showOverview(); return; }
        step = Math.min(stops.length, number);
        flight = null;
        map.closePopup();
        map.removeLayer(overview);
        scene.clearLayers();
        const current = stops[step - 1];
        const previous = stops[step - 2];
        card.hidden = false;
        const content = chapterTemplates[step - 1].cloneNode(true);
        content.querySelector(".journey-card-title").setAttribute("data-player-title", "");
        content.querySelector(".journey-card-context").setAttribute("data-player-context", "");
        content.querySelector(".journey-card-meta").setAttribute("data-player-meta", "");
        content.querySelector(".journey-card-note").setAttribute("data-player-note", "");
        card.replaceChildren(content);
        section.querySelectorAll("[data-stop-number]").forEach(row => row.classList.toggle("is-selected", Number(row.dataset.stopNumber) === step));
        const cityName = chapter => chapter.locations.length === 1 ? text(chapter.locations[0].name, language) : text(chapter.title, language);
        const destination = makeMarker(current.anchor, current.id, text(current.title, language), Boolean(current.current));
        destination.bindTooltip(tooltip(cityName(current), current.current ? labels.now : step === 1 ? labels.started : ""), {
          permanent: true, direction: "bottom", offset: [0, 18], className: "journey-place-label", opacity: 1,
        });
        bindChapter(destination, current);
        destination.addTo(scene);
        const view = L.latLngBounds([current.anchor]);
        if (previous) {
          const origin = makeMarker(previous.anchor, previous.id, text(previous.title, language), false, true);
          origin.bindTooltip(tooltip(cityName(previous), previous.number === 1 ? labels.started : ""), {
            permanent: true, direction: "top", offset: [0, -13], className: "journey-place-label", opacity: 1,
          });
          bindChapter(origin, previous);
          origin.addTo(scene);
          const segments = connection(previous.anchor, current.anchor);
          segments.flat().forEach(point => view.extend(point));
          L.polyline(segments, { className: "journey-route-background", color: "#9cb7bb", weight: 1.5, opacity: 0.45, interactive: false }).addTo(scene);
          const color = current.current ? "#286b54" : "#205d70";
          const line = L.polyline([], { className: "journey-route", color, weight: 2.5, opacity: 0.95, interactive: false }).addTo(scene);
          const dot = L.circleMarker(previous.anchor, { className: "journey-traveller", radius: 5, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1, interactive: false }).addTo(scene);
          flight = { segments, line, dot, progress: 0 };
          flow.dataset.routeStep = String(step);
          flow.querySelector(".flow-number").textContent = String(step);
          flow.querySelector(".map-sr-only").textContent = `${labels.stop} ${step}: ${cityName(previous)} → ${cityName(current)}`;
          bindChapter(direction, current);
          direction.addTo(scene);
          direction.getElement().classList.toggle("journey-flow-current", Boolean(current.current));
        }
        const distance = previous ? L.latLng(previous.anchor).distanceTo(current.anchor) : 0;
        map.fitBounds(view, { padding: [60, 55], maxZoom: previous ? distance < 700000 ? 10 : 4 : 5, animate: false });
        positionGeometry();
        status.hidden = true;
        updateControls();
        if (flight && animate && !reduceMotion && distance > 100) runFlight();
        else {
          if (flight) { flight.progress = 1; drawProgress(1); scene.removeLayer(flight.dot); }
          if (playing && step === stops.length) pause();
          else { updateControls(); scheduleNext(); }
        }
      }

      playButton.addEventListener("click", () => {
        if (playing) { pause(); return; }
        map.closePopup();
        playing = true;
        updateControls();
        if (step === 0 || step === stops.length && (!flight || flight.progress >= 1)) showStep(1, false);
        else if (flight && flight.progress < 1) runFlight();
        else showStep(step + 1, true);
      });
      previousButton.addEventListener("click", () => { pause(); showStep(step - 1, false); });
      nextButton.addEventListener("click", () => { pause(); showStep(step + 1, true); });
      slider.addEventListener("input", () => {
        const requested = Number(slider.value);
        pause();
        showStep(requested, false);
      });
      section.querySelectorAll("[data-map-stop]").forEach(button => {
        button.hidden = false;
        button.addEventListener("click", () => {
          pause();
          showStep(Number(button.dataset.mapStop), true);
          ui.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "center" });
        });
      });
      map.on("zoomend moveend", positionGeometry);
      map.on("dragstart", pause);
      document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
      if ("ResizeObserver" in window) {
        let width = container.clientWidth;
        new ResizeObserver(() => {
          if (width === container.clientWidth) return;
          width = container.clientWidth;
          map.invalidateSize({ pan: false });
          scene.eachLayer(layer => {
            const popup = layer.getPopup?.();
            if (popup) {
              popup.options.maxWidth = Math.min(270, width - 70);
              popup.options.maxHeight = Math.max(100, container.clientHeight - 80);
              if (layer.isPopupOpen()) {
                popup.update();
                const scrolling = popup.getElement().querySelector(".leaflet-popup-scrolled");
                if (scrolling) scrolling.tabIndex = 0;
              }
            }
          });
          if (step === 0) map.fitBounds(overviewBounds, { padding: [45, 55], maxZoom: 2.5, animate: false });
          positionGeometry();
        }).observe(container);
      }
      showOverview();
      section.dataset.mapState = "ready";
    } catch (error) {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      if (map) { try { map.remove(); } catch (_) { container.replaceChildren(); } }
      ui.hidden = true;
      timeline.open = true;
      section.querySelectorAll("[data-map-stop]").forEach(button => { button.hidden = true; });
      status.hidden = false;
      status.textContent = labels.unavailable;
      section.dataset.mapState = "error";
      console.warn("Journey player:", error.message);
    }
  }
  document.querySelectorAll("[data-places-map]").forEach(initialize);
})();
