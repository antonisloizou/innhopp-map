import { formatDate, trapFocus } from './utils.js';

/**
 * Create an info card controller attached to the card region.
 * @param {HTMLElement} region
 * @param {{ onClose?: (payload: { id: string; origin: HTMLElement | null }) => void }} options
 */
export function createInfoCard(region, options = {}) {
  let currentId = null;
  let cleanupFocusTrap = null;
  let anchorButton = null;
  const card = document.createElement('article');
  card.className = 'atm-card';
  card.hidden = true;
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

  closeButton.addEventListener('click', () => close());

  function open(event, origin) {
    currentId = event.id;
    card.hidden = false;
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
      positionCard(card, anchorButton);
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
    anchorButton = null;
    cleanupFocusTrap?.();
    cleanupFocusTrap = null;
    options.onClose?.({ id: closedId, origin });
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

  function reposition() {
    if (!currentId) return;
    card.dataset.docked = shouldDock() ? 'true' : 'false';
    positionCard(card, card.dataset.docked === 'true' ? null : anchorButton);
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

function positionCard(card, origin) {
  if (!origin || card.dataset.docked === 'true') {
    card.style.left = 'auto';
    card.style.top = 'auto';
    return;
  }

  const originRect = origin.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = originRect.left + originRect.width / 2 - cardRect.width / 2;
  let top = originRect.top - cardRect.height - 16;

  if (top < 16) {
    top = originRect.bottom + 16;
  }

  if (left < 16) {
    left = 16;
  } else if (left + cardRect.width > viewportWidth - 16) {
    left = viewportWidth - cardRect.width - 16;
  }

  if (top + cardRect.height > viewportHeight - 16) {
    top = viewportHeight - cardRect.height - 16;
  }

  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(top)}px`;
}
