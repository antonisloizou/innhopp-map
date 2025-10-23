import { debounce } from './utils.js';

export function initControls(root, { groups = [] } = {}) {
  const searchInput = root.querySelector('#atm-search');
  const filterSelect = root.querySelector('#atm-filter');
  const timelineGroup = root.querySelector('.atm-timeline');
  const zoomIndicator = root.querySelector('#atm-zoom-indicator');

  populateGroups(groups);

  const listeners = new Map();

  const emit = (type, detail) => {
    listeners.get(type)?.forEach((cb) => cb(detail));
  };

  if (searchInput) {
    const handleSearch = debounce(() => {
      emit('search', searchInput.value.trim());
    }, 200);
    searchInput.addEventListener('input', handleSearch);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      emit('group', filterSelect.value);
    });
  }

  timelineGroup?.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const action = event.target.dataset.action;
    if (!action) return;
    emit(action, undefined);
  });

  root.querySelectorAll('[data-action="reset"]').forEach((btn) => {
    btn.addEventListener('click', () => emit('reset'));
  });

  root.querySelectorAll('[data-action="fit"]').forEach((btn) => {
    btn.addEventListener('click', () => emit('fit'));
  });

  function on(type, callback) {
    const set = listeners.get(type) || new Set();
    set.add(callback);
    listeners.set(type, set);
    return () => off(type, callback);
  }

  function off(type, callback) {
    const set = listeners.get(type);
    if (!set) return;
    set.delete(callback);
  }

  function setPlayState(playing) {
    const playBtn = root.querySelector('[data-action="play"]');
    if (!(playBtn instanceof HTMLElement)) return;
    playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    playBtn.textContent = playing ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'Pause timeline' : 'Play timeline');
  }

  function setZoom(level) {
    if (zoomIndicator) {
      zoomIndicator.textContent = `${Math.round(level * 100)}%`;
    }
  }

  function populateGroups(groupsList) {
    if (!filterSelect) return;
    const currentValue = filterSelect.value;
    const fragment = document.createDocumentFragment();
    fragment.append(new Option('All groups', 'all'));
    groupsList.forEach((group) => {
      fragment.append(new Option(group, group));
    });
    filterSelect.innerHTML = '';
    filterSelect.append(fragment);
    if (groupsList.includes(currentValue)) {
      filterSelect.value = currentValue;
    }
  }

  function setGroupValue(value) {
    if (filterSelect) {
      filterSelect.value = value;
    }
  }

  function setTimelineStatus(index, total) {
    if (!timelineGroup) return;
    if (total <= 0 || index < 0) {
      timelineGroup.removeAttribute('data-position');
      timelineGroup.title = 'Timeline controls';
      return;
    }
    timelineGroup.setAttribute('data-position', `${index + 1} / ${total}`);
    timelineGroup.title = `Event ${index + 1} of ${total}`;
  }

  function resetSearch() {
    if (searchInput) {
      searchInput.value = '';
    }
    emit('search', '');
  }

  return {
    on,
    off,
    setPlayState,
    setZoom,
    setTimelineStatus,
    populateGroups,
    resetSearch,
    setGroupValue
  };
}
