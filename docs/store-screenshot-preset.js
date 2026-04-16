const REVIEW_PRESET_ZOOM_SCALE = 1.8;
const REVIEW_PRESET_ZOOM_Y_OFFSET = 120;
const REVIEW_PRESET_ZOOM_CONTAINER_SELECTOR = '#page-shell';
const REVIEW_PRESET_PLUGIN_SELECTOR = '#better-reviews-for-amazon-extra';
const REVIEW_PRESET_FALLBACK_SELECTOR = '#averageCustomerReviews_feature_div';
const REVIEW_PRESET_SPACING_CLASS = 'a-spacing-small';

function installScreenshotPresetController() {
  const search = new URLSearchParams(window.location.search);
  const preset = search.get('preset');
  if (!preset) {
    return;
  }

  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const applyZoomToTarget = (target) => {
    const container = document.querySelector(REVIEW_PRESET_ZOOM_CONTAINER_SELECTOR);
    if (!container || !target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const translateX = rect.left - rect.left * REVIEW_PRESET_ZOOM_SCALE;
    const desiredTop = rect.top + REVIEW_PRESET_ZOOM_Y_OFFSET;
    const translateY = desiredTop - rect.top * REVIEW_PRESET_ZOOM_SCALE;

    container.style.transformOrigin = '0 0';
    container.style.transition = 'none';
    container.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${REVIEW_PRESET_ZOOM_SCALE})`;
    container.style.willChange = 'transform';
  };

  const showPluginImmediately = () => {
    const plugin = document.querySelector(REVIEW_PRESET_PLUGIN_SELECTOR);
    if (!plugin) {
      return null;
    }

    plugin.classList.remove('is-animating');
    plugin.classList.add('is-visible');
    plugin.classList.add(REVIEW_PRESET_SPACING_CLASS);
    plugin.style.height = 'auto';
    plugin.style.overflow = 'visible';
    plugin.style.opacity = '1';
    plugin.style.pointerEvents = 'auto';
    plugin.setAttribute('aria-hidden', 'false');
    return plugin;
  };

  const hideControls = () => {
    document.body.classList.add('is-recording-demo');
  };

  const applyPreset = async () => {
    await wait(80);

    if (preset === 'zoomed-active') {
      hideControls();

      const plugin = showPluginImmediately();

      if (window.reviewHighlight && typeof window.reviewHighlight.show === 'function') {
        window.reviewHighlight.show();
      }

      await wait(40);

      applyZoomToTarget(plugin || document.querySelector(REVIEW_PRESET_FALLBACK_SELECTOR));

      if (window.reviewHighlight && typeof window.reviewHighlight.update === 'function') {
        window.reviewHighlight.update();
      }
    }
  };

  window.addEventListener('load', () => {
    applyPreset().catch((error) => {
      console.error('[store-screenshot-preset]', error);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installScreenshotPresetController, { once: true });
} else {
  installScreenshotPresetController();
}
