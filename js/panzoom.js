export function initPanzoom(stage, { onZoom } = {}) {
  if (!window.Panzoom) {
    throw new Error('Panzoom library is required');
  }

  const instance = window.Panzoom(stage, {
    contain: 'outside',
    maxScale: 5,
    minScale: 0.5,
    step: 0.18,
    setTransform: (elem, { scale, x, y }) => {
      elem.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      onZoom?.(scale);
    }
  });

  const parent = stage.parentElement;
  parent?.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey) event.preventDefault();
      instance.zoomWithWheel(event);
    },
    { passive: false }
  );

  stage.addEventListener('panzoomchange', (event) => {
    const detail = event.detail;
    if (detail?.scale != null) {
      onZoom?.(detail.scale);
    }
  });

  function reset() {
    instance.reset({ animate: false });
    onZoom?.(instance.getScale());
  }

  function fitToScreen() {
    const container = parent ?? stage;
    const img = stage.querySelector('img');
    if (!(img instanceof HTMLImageElement)) return;
    const containerRect = container.getBoundingClientRect();
    const naturalWidth = img.naturalWidth || containerRect.width;
    const naturalHeight = img.naturalHeight || containerRect.height;
    const scale = Math.min(containerRect.width / naturalWidth, containerRect.height / naturalHeight);
    if (!Number.isFinite(scale) || scale <= 0) return;
    instance.zoomToPoint(scale, {
      clientX: containerRect.left + containerRect.width / 2,
      clientY: containerRect.top + containerRect.height / 2
    });
    instance.moveTo(0, 0);
    onZoom?.(scale);
  }

  return {
    instance,
    reset,
    fitToScreen,
    getScale: () => instance.getScale()
  };
}
