import { fetchJSON, getQueryParam, setQueryParam, sortByDate, announce, prefersReducedMotion, clamp } from './utils.js';
import { renderHotspots } from './renderHotspots.js';
import { createInfoCard } from './infoCard.js';

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
    mapElement: map,
    onClose: ({ id, origin } = {}) => {
      state.activeId = null;
      hotspots.setActive(null);
      setQueryParam('event', '');
      const target = origin ?? (id ? hotspots.getButton(id) : null);
      target?.focus({ preventScroll: true });
    }
  });
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
      infoCard.reposition();
    };

    if (baseImage.complete) {
      handleBaseImageReady();
    } else {
      baseImage.addEventListener('load', handleBaseImageReady, { once: true });
    }
  }

  map.addEventListener('pointerdown', (event) => {
    if (!state.activeId) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.atm-hotspot') || target.closest('.atm-card')) {
      return;
    }
    infoCard.close();
  });

  map.addEventListener(
    'scroll',
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
      if (next) selectEvent(next.id, { focusHotspot: true, scrollIntoView: true });
    } else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const prev = getAdjacentEvent(-1);
      if (prev) selectEvent(prev.id, { focusHotspot: true, scrollIntoView: true });
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
      const shouldEnsureVisible =
        !!options.scrollIntoView || !isHotspotFullyVisible(mapElement, originButton);
      if (!shouldEnsureVisible) {
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
          requestAnimationFrame(() => infoCard.reposition());
        });
      } else {
        originButton.scrollIntoView({ behavior, block: 'center', inline: 'center' });
        requestAnimationFrame(() => infoCard.reposition());
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
    const cardWidth = cardElement.offsetWidth || cardElement.getBoundingClientRect().width || 0;

    const buttonCenterWithinMap = buttonRect.left - mapRect.left + buttonRect.width / 2;
    const buttonCenterAbsolute = mapElement.scrollLeft + buttonCenterWithinMap;

    const padding = 16;
    const reservedWidth = Math.min(cardWidth + padding * 2, mapElement.clientWidth);
    const freeWidth = Math.max(mapElement.clientWidth - reservedWidth, 0);
    const centerOffset =
      freeWidth > 0 ? padding + freeWidth / 2 : mapElement.clientWidth / 2;

    const desiredScrollLeft = clamp(
      buttonCenterAbsolute - centerOffset,
      0,
      scrollableRange
    );

    if (Math.abs(desiredScrollLeft - mapElement.scrollLeft) > 1) {
      mapElement.scrollTo({ left: desiredScrollLeft, behavior });
    }
  }

  function isHotspotFullyVisible(container, element) {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return (
      elementRect.left >= containerRect.left &&
      elementRect.right <= containerRect.right &&
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom
    );
  }
}
