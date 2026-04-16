const REVIEW_SCENE_INITIAL_DELAY_MS = 1000;
const REVIEW_SCENE_HIGHLIGHT_DELAY_MS = 500;
const REVIEW_SCENE_ZOOM_DELAY_MS = 500;
const REVIEW_SCENE_PLUGIN_DELAY_MS = 1500;
const REVIEW_SCENE_ZOOM_DURATION_MS = 500;
const REVIEW_SCENE_HIGHLIGHT_HIDE_DELAY_MS = 500;
const REVIEW_SCENE_PLUGIN_HIDE_DELAY_MS = 320;
const REVIEW_SCENE_ZOOM_SCALE = 1.8;
const REVIEW_SCENE_ZOOM_Y_OFFSET = 120;
const REVIEW_SCENE_ZOOM_TRANSITION = 'transform 0.5s ease';
const REVIEW_SCENE_ZOOM_CONTAINER_SELECTOR = '#page-shell';
const REVIEW_SCENE_FALLBACK_TARGET_SELECTOR = '#averageCustomerReviews_feature_div';
const REVIEW_SCENE_PLUGIN_TARGET_SELECTOR = '#better-reviews-for-amazon-extra';

function installReviewSceneController() {
  const zoomContainer = document.querySelector(REVIEW_SCENE_ZOOM_CONTAINER_SELECTOR);
  if (!zoomContainer) {
    return;
  }

  let state = 'collapsed';
  let sceneToken = 0;
  let trackingFrame = 0;

  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const refreshHighlight = () => {
    if (window.reviewHighlight && typeof window.reviewHighlight.update === 'function') {
      window.reviewHighlight.update();
    }
  };

  const stopHighlightTracking = () => {
    if (trackingFrame) {
      cancelAnimationFrame(trackingFrame);
      trackingFrame = 0;
    }
  };

  const startHighlightTracking = (token) => {
    stopHighlightTracking();

    const tick = () => {
      if (token !== sceneToken) {
        trackingFrame = 0;
        return;
      }

      refreshHighlight();
      trackingFrame = requestAnimationFrame(tick);
    };

    trackingFrame = requestAnimationFrame(tick);
  };

  const resolveZoomTarget = () => {
    const pluginTarget = document.querySelector(REVIEW_SCENE_PLUGIN_TARGET_SELECTOR);
    if (
      pluginTarget &&
      pluginTarget.getAttribute('aria-hidden') !== 'true' &&
      pluginTarget.getBoundingClientRect().height > 0
    ) {
      return pluginTarget;
    }

    return document.querySelector(REVIEW_SCENE_FALLBACK_TARGET_SELECTOR);
  };

  const getZoomTransform = () => {
    const target = resolveZoomTarget();
    if (!target) {
      return '';
    }

    const rect = target.getBoundingClientRect();
    const translateX = rect.left - rect.left * REVIEW_SCENE_ZOOM_SCALE;
    const desiredTop = rect.top + REVIEW_SCENE_ZOOM_Y_OFFSET;
    const translateY = desiredTop - rect.top * REVIEW_SCENE_ZOOM_SCALE;

    return `translate3d(${translateX}px, ${translateY}px, 0) scale(${REVIEW_SCENE_ZOOM_SCALE})`;
  };

  const applyZoom = () => {
    zoomContainer.style.transformOrigin = '0 0';
    zoomContainer.style.transition = REVIEW_SCENE_ZOOM_TRANSITION;
    zoomContainer.style.transform = getZoomTransform();
    zoomContainer.style.willChange = 'transform';
    refreshHighlight();
  };

  const clearZoom = async (token) => {
    zoomContainer.style.transform = '';
    refreshHighlight();
    await wait(REVIEW_SCENE_ZOOM_DURATION_MS);

    if (token !== sceneToken) {
      return false;
    }

    zoomContainer.style.transition = '';
    zoomContainer.style.transformOrigin = '';
    zoomContainer.style.willChange = '';
    refreshHighlight();
    return true;
  };

  const playForward = async () => {
    if (!window.reviewHighlight || !window.reviewPlugin) {
      return false;
    }

    if (state === 'expanded' || state === 'expanding') {
      return true;
    }

    sceneToken += 1;
    const token = sceneToken;
    state = 'expanding';
    startHighlightTracking(token);

    await wait(REVIEW_SCENE_INITIAL_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    window.reviewHighlight.show();
    await wait(REVIEW_SCENE_HIGHLIGHT_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    applyZoom();
    await wait(REVIEW_SCENE_ZOOM_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    window.reviewPlugin.show();
    await wait(REVIEW_SCENE_PLUGIN_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    const cleared = await clearZoom(token);
    if (!cleared) {
      return false;
    }

    stopHighlightTracking();
    state = 'expanded';
    refreshHighlight();
    return true;
  };

  const playOnce = async () => {
    const didPlayForward = await playForward();
    if (!didPlayForward) {
      return false;
    }

    window.reviewHighlight.hide();
    await wait(REVIEW_SCENE_HIGHLIGHT_HIDE_DELAY_MS);
    window.reviewPlugin.hide();
    await wait(REVIEW_SCENE_PLUGIN_HIDE_DELAY_MS);

    state = 'collapsed';
    refreshHighlight();
    return true;
  };

  const playBackward = async () => {
    if (!window.reviewHighlight || !window.reviewPlugin) {
      return false;
    }

    if (state === 'collapsed' || state === 'collapsing') {
      return true;
    }

    sceneToken += 1;
    const token = sceneToken;
    state = 'collapsing';
    startHighlightTracking(token);

    await wait(REVIEW_SCENE_INITIAL_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    window.reviewHighlight.show();
    await wait(REVIEW_SCENE_HIGHLIGHT_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    applyZoom();
    await wait(REVIEW_SCENE_ZOOM_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    window.reviewPlugin.hide();
    await wait(REVIEW_SCENE_PLUGIN_DELAY_MS);

    if (token !== sceneToken) {
      return false;
    }

    const cleared = await clearZoom(token);
    if (!cleared) {
      return false;
    }

    stopHighlightTracking();
    state = 'collapsed';
    refreshHighlight();
    return true;
  };

  const toggle = async () => {
    return state === 'collapsed' || state === 'collapsing' ? playForward() : playBackward();
  };

  window.reviewScene = {
    showHighlightThenPlugin: playOnce,
    playOnce,
    playForward,
    playBackward,
    toggle,
    initialDelayMs: REVIEW_SCENE_INITIAL_DELAY_MS,
    highlightDelayMs: REVIEW_SCENE_HIGHLIGHT_DELAY_MS,
    zoomDelayMs: REVIEW_SCENE_ZOOM_DELAY_MS,
    pluginDelayMs: REVIEW_SCENE_PLUGIN_DELAY_MS,
    zoomDurationMs: REVIEW_SCENE_ZOOM_DURATION_MS,
    pluginHideDelayMs: REVIEW_SCENE_PLUGIN_HIDE_DELAY_MS,
    highlightHideDelayMs: REVIEW_SCENE_HIGHLIGHT_HIDE_DELAY_MS,
    isExpanded: () => state === 'expanded' || state === 'expanding'
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installReviewSceneController, { once: true });
} else {
  installReviewSceneController();
}
