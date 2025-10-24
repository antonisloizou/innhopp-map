import { formatDate, trapFocus } from './utils.js';

/**
 * Create an info card controller attached to the card region.
 * @param {HTMLElement} region
 * @param {{ onClose?: (payload: { id: string; origin: HTMLElement | null }) => void; mapElement?: HTMLElement }} options
 */
export function createInfoCard(region, options = {}) {
  const { onClose, mapElement: suppliedMapElement } = options;
  const mapElement = suppliedMapElement instanceof HTMLElement ? suppliedMapElement : null;
  let currentId = null;
  let cleanupFocusTrap = null;
  let anchorButton = null;
  const card = document.createElement('article');
  card.className = 'atm-card';
  card.hidden = true;
  card.setAttribute('aria-hidden', 'true');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'false');
  card.dataset.docked = 'false';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.dataset.close = 'true';
  closeButton.setAttribute('aria-label', 'Close details');
  closeButton.innerHTML = '&times;';

  const header = document.createElement('header');
  const title = document.createElement('h2');
  title.className = 'atm-card-title';
  title.id = 'atm-card-title';
  const summary = document.createElement('p');
  summary.className = 'atm-card-summary';

  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'atm-media';

  const details = document.createElement('div');
  details.className = 'atm-card-details';

  const footer = document.createElement('footer');
  const groupChip = document.createElement('span');
  groupChip.className = 'atm-group-chip';
  const dateLabel = document.createElement('time');

  header.append(closeButton, title, summary);
  footer.append(groupChip, dateLabel);
  card.append(header, mediaContainer, details, footer);
  region.appendChild(card);
  const positionDockedCard = positionDockedCardFactory(card, mapElement, () => anchorButton);

  closeButton.addEventListener('click', () => close());

  function open(event, origin) {
    currentId = event.id;
    card.hidden = false;
    card.setAttribute('aria-hidden', 'false');
    card.dataset.docked = shouldDock() ? 'true' : 'false';
    anchorButton = origin || null;
    card.setAttribute('aria-labelledby', title.id);
    title.textContent = event.title;
    summary.textContent = event.summary;
    groupChip.textContent = event.group;
    groupChip.style.setProperty('--chip-color', event.color || '#38bdf8');
    dateLabel.textContent = formatDate(event.date);
    dateLabel.dateTime = event.date;

    mediaContainer.innerHTML = '';
    if (Array.isArray(event.media)) {
      event.media.forEach((item) => {
        const node = createMediaNode(item);
        if (node) mediaContainer.appendChild(node);
      });
    }
    mediaContainer.hidden = mediaContainer.childElementCount === 0;

    details.innerHTML = '';
    if (window.DOMPurify) {
      details.innerHTML = window.DOMPurify.sanitize(event.detailsHTML, {
        USE_PROFILES: { html: true }
      });
    } else {
      details.innerHTML = event.detailsHTML;
    }

    requestAnimationFrame(() => {
      reposition();
      const focusTarget = card.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus({ preventScroll: true });
      }
      cleanupFocusTrap?.();
      cleanupFocusTrap = trapFocus(card);
    });
  }

  function close() {
    if (currentId === null) return;
    const closedId = currentId;
    const origin = anchorButton;
    currentId = null;
    card.hidden = true;
    card.setAttribute('aria-hidden', 'true');
    anchorButton = null;
    cleanupFocusTrap?.();
    cleanupFocusTrap = null;
    card.style.left = 'auto';
    card.style.top = 'auto';
    card.style.right = '';
    card.style.bottom = '';
    card.style.transform = '';
    onClose?.({ id: closedId, origin });
  }

  function shouldDock() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function getCurrentId() {
    return currentId;
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && currentId) {
      event.stopPropagation();
      close();
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  function handlePointerDown(event) {
    if (!currentId) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (card.contains(target)) return;
    if (target instanceof Element && target.closest('.atm-hotspot')) return;
    close();
  }

  document.addEventListener('pointerdown', handlePointerDown);

  function reposition() {
    if (!currentId) return;
    const docked = shouldDock();
    card.dataset.docked = docked ? 'true' : 'false';
    if (docked) {
      positionDockedCard();
      return;
    }
    card.style.transform = '';
    card.style.bottom = '';
    card.style.right = '';
    positionCard(card, anchorButton);
  }

  return { open, close, getCurrentId, element: card, reposition };
}

function createMediaNode(media) {
  if (!media || !media.src) return null;
  if (media.type === 'video') {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.tabIndex = 0;
    video.innerHTML = `<source src="${media.src}" type="video/mp4" />`;
    if (media.alt) video.setAttribute('aria-label', media.alt);
    return video;
  }
  const img = document.createElement('img');
  img.src = media.src;
  img.alt = media.alt || '';
  img.loading = 'lazy';
  return img;
}

function positionDockedCardFactory(card, mapElement, getAnchor) {
  const padding = 16;
  return function positionDockedCard() {
    card.style.top = 'auto';
    if (!(mapElement instanceof HTMLElement)) {
      card.style.left = '50%';
      card.style.transform = 'translateX(-50%)';
      card.style.bottom = `${padding}px`;
      return;
    }
    const cardWidth = card.offsetWidth || card.getBoundingClientRect().width;
    const visibleWidth = mapElement.clientWidth;
    const scrollLeft = mapElement.scrollLeft;
    if (!cardWidth || !visibleWidth) {
      card.style.left = `${scrollLeft + visibleWidth / 2}px`;
      card.style.transform = 'translateX(-50%)';
      card.style.bottom = `${padding}px`;
      return;
    }

    const mapRect = mapElement.getBoundingClientRect();
    const anchor = getAnchor?.() ?? null;

    let desiredCenter = scrollLeft + visibleWidth / 2;
    if (anchor instanceof HTMLElement) {
      const anchorRect = anchor.getBoundingClientRect();
      desiredCenter = scrollLeft + (anchorRect.left - mapRect.left) + anchorRect.width / 2;
    }

    const minCenter = scrollLeft + padding + cardWidth / 2;
    const maxCenter = scrollLeft + visibleWidth - padding - cardWidth / 2;
    if (minCenter > maxCenter) {
      desiredCenter = scrollLeft + visibleWidth / 2;
    } else {
      desiredCenter = Math.min(Math.max(desiredCenter, minCenter), maxCenter);
    }

    const left = Math.round(desiredCenter - cardWidth / 2);

    card.style.left = `${left}px`;
    card.style.transform = 'none';
    card.style.right = 'auto';
    card.style.bottom = `${padding}px`;
  };
}

function positionCard(card, origin) {
  if (!origin || card.dataset.docked === 'true') {
    card.style.left = 'auto';
    card.style.top = 'auto';
    return;
  }

  const region = card.parentElement;
  if (!(region instanceof HTMLElement)) {
    return;
  }

  const padding = 16;
  const originRect = origin.getBoundingClientRect();
  const regionRect = region.getBoundingClientRect();
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;

  let left = originRect.left + originRect.width / 2 - cardWidth / 2 - regionRect.left;
  let top = originRect.top - cardHeight - padding - regionRect.top;

  if (top < padding) {
    top = originRect.bottom + padding - regionRect.top;
  }

  const maxLeft = Math.max(padding, regionRect.width - cardWidth - padding);
  const maxTop = Math.max(padding, regionRect.height - cardHeight - padding);

  left = Math.min(Math.max(left, padding), maxLeft);
  top = Math.min(Math.max(top, padding), maxTop);

  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(top)}px`;
}
