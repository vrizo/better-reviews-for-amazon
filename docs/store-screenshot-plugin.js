const REVIEW_PLUGIN_SELECTOR = '#better-reviews-for-amazon-extra';
const REVIEW_PLUGIN_SPACING_CLASS = 'a-spacing-small';

function installReviewPluginController() {
  const element = document.querySelector(REVIEW_PLUGIN_SELECTOR);
  if (!element) {
    return;
  }

  let state = 'hidden';
  let transitionToken = 0;
  let highlightTrackingFrame = 0;

  const refreshHighlight = () => {
    if (window.reviewHighlight && typeof window.reviewHighlight.update === 'function') {
      window.reviewHighlight.update();
    }
  };

  const stopHighlightTracking = () => {
    if (highlightTrackingFrame) {
      cancelAnimationFrame(highlightTrackingFrame);
      highlightTrackingFrame = 0;
    }

    if (window.reviewHighlight && typeof window.reviewHighlight.setTracking === 'function') {
      window.reviewHighlight.setTracking(false);
    }
  };

  const startHighlightTracking = () => {
    stopHighlightTracking();

    if (window.reviewHighlight && typeof window.reviewHighlight.setTracking === 'function') {
      window.reviewHighlight.setTracking(true);
    }

    const tick = () => {
      refreshHighlight();

      if (state === 'showing' || state === 'hiding') {
        highlightTrackingFrame = requestAnimationFrame(tick);
        return;
      }

      highlightTrackingFrame = 0;
    };

    highlightTrackingFrame = requestAnimationFrame(tick);
  };

  const setExpandedHeight = () => {
    element.style.height = `${element.scrollHeight}px`;
    refreshHighlight();
  };

  const finishVisible = (token) => {
    if (token !== transitionToken || state !== 'showing') {
      return;
    }

    state = 'visible';
    stopHighlightTracking();
    element.classList.remove('is-animating');
    element.classList.add('is-visible');
    element.classList.add(REVIEW_PLUGIN_SPACING_CLASS);
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
    element.setAttribute('aria-hidden', 'false');
    refreshHighlight();
  };

  const finishHidden = (token) => {
    if (token !== transitionToken || state !== 'hiding') {
      return;
    }

    state = 'hidden';
    stopHighlightTracking();
    element.classList.remove('is-animating', 'is-visible');
    element.classList.remove(REVIEW_PLUGIN_SPACING_CLASS);
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    element.setAttribute('aria-hidden', 'true');
    refreshHighlight();
  };

  const show = () => {
    if (state === 'visible' || state === 'showing') {
      return true;
    }

    transitionToken += 1;
    const token = transitionToken;
    state = 'showing';
    startHighlightTracking();

    element.classList.add('is-animating');
    element.classList.remove('is-visible');
    element.classList.add(REVIEW_PLUGIN_SPACING_CLASS);
    element.style.overflow = 'hidden';
    element.style.height = '0px';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    element.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      if (token !== transitionToken) {
        return;
      }

      element.style.opacity = '1';
      element.style.pointerEvents = 'auto';
      setExpandedHeight();

      const onEnd = (event) => {
        if (event.target !== element || event.propertyName !== 'height') {
          return;
        }
        element.removeEventListener('transitionend', onEnd);
        finishVisible(token);
      };

      element.addEventListener('transitionend', onEnd);
    });

    return true;
  };

  const hide = () => {
    if (state === 'hidden' || state === 'hiding') {
      return true;
    }

    transitionToken += 1;
    const token = transitionToken;
    state = 'hiding';
    startHighlightTracking();

    const currentHeight = element.scrollHeight;
    element.classList.add('is-animating');
    element.classList.remove('is-visible');
    element.style.overflow = 'hidden';
    element.style.height = `${currentHeight}px`;
    element.style.opacity = '1';
    element.style.pointerEvents = 'none';

    void element.offsetHeight;

    requestAnimationFrame(() => {
      if (token !== transitionToken) {
        return;
      }

      element.style.height = '0px';
      element.style.opacity = '0';
      refreshHighlight();

      const onEnd = (event) => {
        if (event.target !== element || event.propertyName !== 'height') {
          return;
        }
        element.removeEventListener('transitionend', onEnd);
        finishHidden(token);
      };

      element.addEventListener('transitionend', onEnd);
    });

    return true;
  };

  const toggle = (force) => {
    if (typeof force === 'boolean') {
      return force ? show() : hide();
    }

    return state === 'hidden' || state === 'hiding' ? show() : hide();
  };

  const update = () => {
    if (state === 'visible') {
      refreshHighlight();
      return true;
    }

    if (state === 'showing') {
      setExpandedHeight();
      return true;
    }

    return false;
  };

  element.classList.remove(REVIEW_PLUGIN_SPACING_CLASS);

  window.addEventListener('resize', update);

  window.reviewPlugin = {
    show,
    hide,
    toggle,
    update,
    selector: REVIEW_PLUGIN_SELECTOR,
    isVisible: () => state === 'visible' || state === 'showing'
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installReviewPluginController, { once: true });
} else {
  installReviewPluginController();
}
