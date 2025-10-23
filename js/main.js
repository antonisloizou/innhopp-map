import { fetchJSON, getQueryParam, setQueryParam, sortByDate, announce, prefersReducedMotion, clamp } from './utils.js';
import { renderHotspots } from './renderHotspots.js';
import { createInfoCard } from './infoCard.js';
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
  visible: [],
  activeId: null
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
  const hotspots = renderHotspots(hotspotsLayer, state.ordered, {
    onSelect: (eventId, origin) => selectEvent(eventId, { origin })
  });
  const infoCard = createInfoCard(cardRegion, {
    onClose: ({ id, origin } = {}) => {
      state.activeId = null;
      hotspots.setActive(null);
      setQueryParam('event', '');
      const target = origin ?? (id ? hotspots.getButton(id) : null);
      target?.focus({ preventScroll: true });
    }
  });
  const panzoom = initPanzoom(stage);

  app.dataset.prefersMotion = prefersReducedMotion() ? 'false' : 'true';

  const urlEvent = getQueryParam('event');
  if (urlEvent) {
    const initialEvent = state.ordered.find((event) => event.id === urlEvent);
    if (initialEvent) {
      selectEvent(initialEvent.id, { scrollIntoView: true });
    }
  }

  if (baseImage instanceof HTMLImageElement) {
    const handleBaseImageReady = () => {
      applyBaseImageMetrics(baseImage);
      panzoom.fitToScreen();
    };

    if (baseImage.complete) {
      handleBaseImageReady();
    } else {
      baseImage.addEventListener('load', handleBaseImageReady, { once: true });
    }
  }

  stage.addEventListener(
    'panzoomchange',
    () => {
      infoCard.reposition();
    },
    { passive: true }
  );

  map.addEventListener('pointerdown', (event) => {
    if (!state.activeId) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.atm-hotspot') || target.closest('.atm-card')) {
      return;
    }
    infoCard.close();
  });

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
      infoCard.close();
    }
  });

  window.addEventListener('popstate', () => {
    const requestedId = getQueryParam('event');
    if (requestedId && requestedId !== state.activeId) {
      selectEvent(requestedId, { scrollIntoView: true });
    }
  });

  function selectEvent(eventId, options = {}) {
    const eventData = state.ordered.find((item) => item.id === eventId);
    if (!eventData) return;
    state.activeId = eventId;
    hotspots.setActive(eventId);
    const originButton = options.origin ?? hotspots.getButton(eventId);
    infoCard.open(eventData, originButton);
    setQueryParam('event', eventId);
    announce(liveRegion, `${eventData.title}. ${eventData.summary}`);

    if (options.focusHotspot && originButton) {
      originButton.focus({ preventScroll: true });
    }

    if (originButton) {
      const mapElement = map instanceof HTMLElement ? map : null;
      if (!mapElement) return;
      const hasHorizontalOverflow = mapElement.scrollWidth > mapElement.clientWidth + 1;
      if (!options.scrollIntoView && !hasHorizontalOverflow) {
        return;
      }

      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      const cardElement = infoCard.element;
      if (cardElement?.dataset.docked === 'true' && hasHorizontalOverflow) {
        requestAnimationFrame(() => {
          adjustHotspotForDockedCard({
            mapElement,
            button: originButton,
            cardElement,
            behavior
          });
        });
      } else {
        originButton.scrollIntoView({ behavior, block: 'center', inline: 'center' });
      }
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

  function applyBaseImageMetrics(img) {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;
    map?.style.setProperty('--atm-map-aspect', String(naturalWidth / naturalHeight));
  }

  function adjustHotspotForDockedCard({ mapElement, button, cardElement, behavior }) {
    const scrollableRange = Math.max(mapElement.scrollWidth - mapElement.clientWidth, 0);
    if (scrollableRange <= 0) {
      button.scrollIntoView({ behavior, block: 'center', inline: 'center' });
      return;
    }

    const mapRect = mapElement.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    const buttonCenterWithinMap = buttonRect.left - mapRect.left + buttonRect.width / 2;
    const buttonCenterAbsolute = mapElement.scrollLeft + buttonCenterWithinMap;

    const intersectsHorizontally =
      cardRect.left < mapRect.right && cardRect.right > mapRect.left;
    const intersectsVertically =
      cardRect.top < mapRect.bottom && cardRect.bottom > mapRect.top;

    let targetCenter = mapRect.width / 2;
    if (intersectsHorizontally && intersectsVertically) {
      const leftFree = Math.max(0, Math.min(cardRect.left, mapRect.right) - mapRect.left);
      const effectiveWidth = Math.max(leftFree, mapRect.width * 0.2);
      targetCenter = effectiveWidth / 2;
    }

    const desiredScrollLeft = clamp(
      buttonCenterAbsolute - targetCenter,
      0,
      scrollableRange
    );

    if (Math.abs(desiredScrollLeft - mapElement.scrollLeft) > 1) {
      mapElement.scrollTo({ left: desiredScrollLeft, behavior });
    }
  }
}
