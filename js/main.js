import { fetchJSON, getQueryParam, setQueryParam, sortByDate, uniqueGroups, announce, prefersReducedMotion } from './utils.js';
import { renderHotspots } from './renderHotspots.js';
import { createInfoCard } from './infoCard.js';
import { initControls } from './controls.js';
import { initPanzoom } from './panzoom.js';

const app = document.querySelector('.atm-app');
const map = document.querySelector('[data-map]');
const stage = map?.querySelector('[data-stage]');
const hotspotsLayer = map?.querySelector('[data-hotspots]');
const cardRegion = map?.querySelector('[data-card-region]');
const liveRegion = document.querySelector('[data-live]');
const baseImage = document.querySelector('#atm-base-image');

if (!app || !stage || !hotspotsLayer || !cardRegion) {
  throw new Error('AnimatedMap: required elements are missing');
}

const state = {
  events: [],
  ordered: [],
  filters: { search: '', group: 'all' },
  visible: [],
  activeId: null,
  playing: false,
  playbackTimer: null
};

(async function boot() {
  try {
    const data = await fetchJSON('data/events.json');
    state.events = Array.isArray(data) ? data : [];
    state.ordered = sortByDate(state.events);
    state.visible = [...state.ordered];
    initialize();
  } catch (error) {
    console.error(error);
    announce(liveRegion, 'Failed to load map data');
  }
})();

function initialize() {
  const controls = initControls(app, { groups: uniqueGroups(state.events) });
  const hotspots = renderHotspots(hotspotsLayer, state.ordered, {
    onSelect: (eventId, origin) => selectEvent(eventId, { origin })
  });
  const infoCard = createInfoCard(cardRegion, {
    onClose: () => {
      state.activeId = null;
      setQueryParam('event', '');
    }
  });
  const panzoom = initPanzoom(stage, {
    onZoom: (scale) => controls.setZoom(scale)
  });

  app.dataset.prefersMotion = prefersReducedMotion() ? 'false' : 'true';

  const urlEvent = getQueryParam('event');
  const initialEvent = state.ordered.find((event) => event.id === urlEvent) ?? state.visible[0];
  if (initialEvent) {
    selectEvent(initialEvent.id);
  }

  if (baseImage instanceof HTMLImageElement) {
    if (baseImage.complete) {
      panzoom.fitToScreen();
    } else {
      baseImage.addEventListener('load', () => panzoom.fitToScreen(), { once: true });
    }
  }

  controls.on('search', (term) => {
    state.filters.search = term.toLowerCase();
    updateVisibility();
  });

  controls.on('group', (group) => {
    state.filters.group = group;
    updateVisibility();
  });

  controls.on('prev', () => {
    const prev = getAdjacentEvent(-1);
    if (prev) selectEvent(prev.id, { scrollIntoView: true });
  });

  controls.on('next', () => {
    const next = getAdjacentEvent(1);
    if (next) selectEvent(next.id, { scrollIntoView: true });
  });

  controls.on('play', () => togglePlayback());

  controls.on('reset', () => {
    stopPlayback();
    controls.resetSearch();
    state.filters = { search: '', group: 'all' };
    controls.populateGroups(uniqueGroups(state.events));
    controls.setGroupValue('all');
    updateVisibility();
    panzoom.reset();
    const first = state.visible[0];
    if (first) selectEvent(first.id, { focusHotspot: true });
  });

  controls.on('fit', () => {
    panzoom.fitToScreen();
  });

  stage.addEventListener(
    'panzoomchange',
    () => {
      infoCard.reposition();
    },
    { passive: true }
  );

  window.addEventListener(
    'resize',
    () => {
      infoCard.reposition();
    },
    { passive: true }
  );

  document.addEventListener('keydown', (event) => {
    if (!state.activeId) return;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const next = getAdjacentEvent(1);
      if (next) selectEvent(next.id, { focusHotspot: true });
    } else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const prev = getAdjacentEvent(-1);
      if (prev) selectEvent(prev.id, { focusHotspot: true });
    } else if (event.key === 'Escape') {
      const currentId = state.activeId;
      infoCard.close();
      if (currentId) {
        const button = hotspots.getButton(currentId);
        button?.focus({ preventScroll: true });
      }
    }
  });

  window.addEventListener('popstate', () => {
    const requestedId = getQueryParam('event');
    if (requestedId && requestedId !== state.activeId) {
      selectEvent(requestedId, { scrollIntoView: true });
    }
  });

  function updateVisibility() {
    stopPlayback();
    const { search, group } = state.filters;
    const filtered = state.ordered.filter((event) => {
      const matchesGroup = group === 'all' || event.group === group;
      const haystack = `${event.title} ${event.summary}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesGroup && matchesSearch;
    });

    state.visible = filtered;
    const visibleIds = new Set(filtered.map((event) => event.id));
    hotspots.updateVisibility((id) => visibleIds.has(id));
    const index = filtered.findIndex((item) => item.id === state.activeId);
    controls.setTimelineStatus(index, filtered.length);

    if (!filtered.length) {
      infoCard.close();
      state.activeId = null;
      announce(liveRegion, 'No events match the current filters.');
      return;
    }

    if (!filtered.some((event) => event.id === state.activeId)) {
      selectEvent(filtered[0].id, { focusHotspot: true });
    } else {
      infoCard.reposition();
    }
  }

  function selectEvent(eventId, options = {}) {
    const eventData = state.ordered.find((item) => item.id === eventId);
    if (!eventData) return;
    state.activeId = eventId;
    hotspots.setActive(eventId);
    const originButton = options.origin ?? hotspots.getButton(eventId);
    infoCard.open(eventData, originButton);
    const index = state.visible.findIndex((item) => item.id === eventId);
    controls.setTimelineStatus(index, state.visible.length);
    setQueryParam('event', eventId);
    announce(liveRegion, `${eventData.title}. ${eventData.summary}`);

    if (options.focusHotspot && originButton) {
      originButton.focus({ preventScroll: true });
    }

    if (options.scrollIntoView && originButton) {
      originButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }

  function getAdjacentEvent(direction) {
    const list = state.visible;
    if (!list.length || !state.activeId) return null;
    const index = list.findIndex((event) => event.id === state.activeId);
    if (index === -1) return list[0];
    const nextIndex = (index + direction + list.length) % list.length;
    return list[nextIndex];
  }

  function togglePlayback() {
    if (state.playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (prefersReducedMotion()) return;
    if (!state.visible.length) return;
    state.playing = true;
    controls.setPlayState(true);
    state.playbackTimer = window.setInterval(() => {
      const next = getAdjacentEvent(1);
      if (next) {
        selectEvent(next.id);
      }
    }, 5000);
  }

  function stopPlayback() {
    if (state.playbackTimer) {
      window.clearInterval(state.playbackTimer);
      state.playbackTimer = null;
    }
    if (state.playing) {
      state.playing = false;
    }
    controls.setPlayState(false);
  }
}
