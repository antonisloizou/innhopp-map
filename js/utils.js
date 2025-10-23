const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

/**
 * Fetch JSON data with error handling.
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.json();
}

/**
 * Debounce helper for search input and resize events.
 * @param {Function} fn
 * @param {number} delay
 */
export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn.apply(null, args), delay);
  };
}

/**
 * Format ISO date strings into localized readable text.
 * @param {string} value
 */
export function formatDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function setQueryParam(name, value) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sortByDate(items) {
  return [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function uniqueGroups(items) {
  const groups = new Set(items.map((item) => item.group));
  return Array.from(groups).sort((a, b) => a.localeCompare(b));
}

export function announce(liveRegion, message) {
  if (!liveRegion) return;
  liveRegion.textContent = '';
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

/**
 * Trap focus within an element while open.
 * @param {HTMLElement} container
 * @returns {() => void}
 */
export function trapFocus(container) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const getFocusable = () =>
    Array.from(container.querySelectorAll(focusableSelectors.join(','))).filter((el) =>
      el instanceof HTMLElement && !el.hasAttribute('inert') && el.offsetParent !== null
    );

  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

export function isPointerWithin(element, x, y) {
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function waitForImages(container) {
  const images = Array.from(container.querySelectorAll('img'));
  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', reject, { once: true });
          })
    )
  );
}
