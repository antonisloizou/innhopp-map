import { clamp } from './utils.js';

/**
 * Render hotspot buttons within the map container.
 * @param {HTMLElement} container
 * @param {Array} events
 * @param {{ onSelect: (eventId: string, origin: HTMLElement) => void }} options
 */
export function renderHotspots(container, events, options = {}) {
  container.innerHTML = '';
  const buttons = new Map();

  events.forEach((event, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'atm-hotspot';
    button.dataset.eventId = event.id;
    button.style.left = `${clamp(event.x, 0, 100)}%`;
    button.style.top = `${clamp(event.y, 0, 100)}%`;
    button.style.transform = 'translate(-50%, -50%)';
    button.style.color = event.color || '#38bdf8';
    button.setAttribute('aria-label', `${event.title}. ${event.summary}`);
    button.setAttribute('tabindex', 0);
    button.setAttribute('aria-pressed', 'false');
    button.dataset.index = String(index);
    button.textContent = event.icon ? iconToGlyph(event.icon) : index + 1;

    button.addEventListener('click', () => {
      options.onSelect?.(event.id, button);
    });

    button.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        options.onSelect?.(event.id, button);
      }
    });

    container.appendChild(button);
    buttons.set(event.id, button);
  });

  function setActive(id) {
    buttons.forEach((btn, eventId) => {
      btn.dataset.active = eventId === id ? 'true' : 'false';
      btn.setAttribute('aria-pressed', eventId === id ? 'true' : 'false');
    });
  }

  function updateVisibility(predicate) {
    buttons.forEach((btn, eventId) => {
      const visible = predicate(eventId);
      btn.dataset.hidden = visible ? 'false' : 'true';
      if (visible) {
        btn.removeAttribute('data-hidden');
        btn.setAttribute('aria-hidden', 'false');
        btn.tabIndex = 0;
      } else {
        btn.setAttribute('data-hidden', 'true');
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      }
    });
  }

  function focus(id) {
    const btn = buttons.get(id);
    btn?.focus({ preventScroll: true });
  }

  function getButton(id) {
    return buttons.get(id) ?? null;
  }

  return {
    setActive,
    updateVisibility,
    focus,
    getButton
  };
}

function iconToGlyph(value) {
  switch (value) {
    case 'info':
      return 'ⓘ';
    case 'spark':
      return '✦';
    case 'chip':
      return '⌁';
    case 'shield':
      return '🛡';
    case 'ai':
      return '🤖';
    default:
      return '●';
  }
}
