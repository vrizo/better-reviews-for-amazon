const REVIEW_HIGHLIGHT_DEFAULT_SELECTOR = '#better-reviews-for-amazon-extra';
const REVIEW_HIGHLIGHT_FALLBACK_SELECTOR = '#averageCustomerReviews_feature_div';
const REVIEW_HIGHLIGHT_PADDING_X = 28;
const REVIEW_HIGHLIGHT_PADDING_TOP = 32;
const REVIEW_HIGHLIGHT_FALLBACK_PADDING_TOP = 10;
const REVIEW_HIGHLIGHT_PADDING_BOTTOM = 10;
const REVIEW_HIGHLIGHT_MAX_WIDTH = 350;
const REVIEW_HIGHLIGHT_RADIUS = 14;
const REVIEW_HIGHLIGHT_CONTAINER_SELECTOR = '#page-shell';

function createHighlightOverlay() {
  const container = document.querySelector(REVIEW_HIGHLIGHT_CONTAINER_SELECTOR);
  if (!container) {
    return null;
  }

  const overlay = document.createElement('div');
  overlay.id = 'review-highlight-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const scrimTop = document.createElement('div');
  scrimTop.id = 'review-highlight-scrim-top';
  scrimTop.className = 'review-highlight-scrim';

  const scrimRight = document.createElement('div');
  scrimRight.id = 'review-highlight-scrim-right';
  scrimRight.className = 'review-highlight-scrim';

  const scrimBottom = document.createElement('div');
  scrimBottom.id = 'review-highlight-scrim-bottom';
  scrimBottom.className = 'review-highlight-scrim';

  const scrimLeft = document.createElement('div');
  scrimLeft.id = 'review-highlight-scrim-left';
  scrimLeft.className = 'review-highlight-scrim';

  const frame = document.createElement('div');
  frame.id = 'review-highlight-frame';

  overlay.append(scrimTop, scrimRight, scrimBottom, scrimLeft, frame);
  container.appendChild(overlay);

  return {
    container,
    overlay,
    frame,
    scrims: {
      top: scrimTop,
      right: scrimRight,
      bottom: scrimBottom,
      left: scrimLeft
    }
  };
}

function getContainerMetrics(container) {
  const rect = container.getBoundingClientRect();
  const width = Math.max(container.scrollWidth, container.clientWidth, 0);
  const height = Math.max(container.scrollHeight, container.clientHeight, 0);
  const scaleX = rect.width > 0 && width > 0 ? rect.width / width : 1;
  const scaleY = rect.height > 0 && height > 0 ? rect.height / height : 1;

  return {
    rect,
    width,
    height,
    scaleX: scaleX || 1,
    scaleY: scaleY || 1
  };
}

function clampRect(rect, bounds) {
  const width = Math.max(0, bounds.width);
  const height = Math.max(0, bounds.height);

  const left = Math.max(0, rect.left);
  const top = Math.max(0, rect.top);
  const right = Math.min(width, rect.right);
  const bottom = Math.min(height, rect.bottom);

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top)
  };
}

function toContainerRect(targetRect, metrics) {
  const left = (targetRect.left - metrics.rect.left) / metrics.scaleX;
  const top = (targetRect.top - metrics.rect.top) / metrics.scaleY;
  const width = targetRect.width / metrics.scaleX;
  const height = targetRect.height / metrics.scaleY;

  return {
    left,
    top,
    right: left + width,
    bottom: top + height
  };
}

function toHighlightRect(targetRect, metrics, { paddingTop = REVIEW_HIGHLIGHT_PADDING_TOP } = {}) {
  const targetLocalRect = toContainerRect(targetRect, metrics);
  const paddedLeft = targetLocalRect.left - REVIEW_HIGHLIGHT_PADDING_X;
  const paddedTop = targetLocalRect.top - paddingTop;
  const paddedRight = targetLocalRect.right + REVIEW_HIGHLIGHT_PADDING_X;
  const paddedBottom = targetLocalRect.bottom + REVIEW_HIGHLIGHT_PADDING_BOTTOM;

  return clampRect({
    left: paddedLeft,
    top: paddedTop,
    right: Math.min(paddedRight, paddedLeft + REVIEW_HIGHLIGHT_MAX_WIDTH),
    bottom: paddedBottom
  }, metrics);
}

function applyHighlightLayout(parts, rect, metrics) {
  const { overlay, frame, scrims } = parts;
  const width = metrics.width;
  const height = metrics.height;

  frame.style.left = `${rect.left}px`;
  frame.style.top = `${rect.top}px`;
  frame.style.width = `${rect.width}px`;
  frame.style.height = `${rect.height}px`;
  frame.style.borderRadius = `${REVIEW_HIGHLIGHT_RADIUS}px`;

  scrims.top.style.left = '0px';
  scrims.top.style.top = '0px';
  scrims.top.style.width = `${width}px`;
  scrims.top.style.height = `${rect.top}px`;

  scrims.right.style.left = `${rect.right}px`;
  scrims.right.style.top = `${rect.top}px`;
  scrims.right.style.width = `${Math.max(0, width - rect.right)}px`;
  scrims.right.style.height = `${rect.height}px`;

  scrims.bottom.style.left = '0px';
  scrims.bottom.style.top = `${rect.bottom}px`;
  scrims.bottom.style.width = `${width}px`;
  scrims.bottom.style.height = `${Math.max(0, height - rect.bottom)}px`;

  scrims.left.style.left = '0px';
  scrims.left.style.top = `${rect.top}px`;
  scrims.left.style.width = `${rect.left}px`;
  scrims.left.style.height = `${rect.height}px`;

  overlay.dataset.targetLeft = String(rect.left);
  overlay.dataset.targetTop = String(rect.top);
  overlay.dataset.targetWidth = String(rect.width);
  overlay.dataset.targetHeight = String(rect.height);
}

function resolveDefaultTarget() {
  const pluginTarget = document.querySelector(REVIEW_HIGHLIGHT_DEFAULT_SELECTOR);
  if (
    pluginTarget &&
    pluginTarget.getAttribute('aria-hidden') !== 'true' &&
    pluginTarget.getBoundingClientRect().height > 0
  ) {
    return pluginTarget;
  }

  return document.querySelector(REVIEW_HIGHLIGHT_FALLBACK_SELECTOR);
}

function isPluginTarget(target) {
  return target?.id === 'better-reviews-for-amazon-extra';
}

function resolveTarget(targetOrSelector) {
  if (!targetOrSelector) {
    return resolveDefaultTarget();
  }

  if (typeof targetOrSelector === 'string') {
    return document.querySelector(targetOrSelector);
  }

  return targetOrSelector instanceof Element ? targetOrSelector : null;
}

function installReviewHighlight() {
  const parts = createHighlightOverlay();
  if (!parts) {
    return;
  }

  let currentTargetInput = null;
  let framePending = false;

  const update = (targetOrSelector = currentTargetInput) => {
    const target = resolveTarget(targetOrSelector);
    if (!target) {
      return false;
    }

    const metrics = getContainerMetrics(parts.container);

    applyHighlightLayout(
      parts,
      toHighlightRect(target.getBoundingClientRect(), metrics, {
        paddingTop: isPluginTarget(target)
          ? REVIEW_HIGHLIGHT_PADDING_TOP
          : REVIEW_HIGHLIGHT_FALLBACK_PADDING_TOP
      }),
      metrics
    );
    return true;
  };

  const requestUpdate = () => {
    if (!parts.overlay.classList.contains('is-visible') || framePending) {
      return;
    }

    framePending = true;
    requestAnimationFrame(() => {
      framePending = false;
      update();
    });
  };

  const show = (targetOrSelector) => {
    currentTargetInput = targetOrSelector ?? null;
    const didUpdate = update(targetOrSelector);
    if (!didUpdate) {
      return false;
    }

    parts.overlay.classList.add('is-visible');
    return true;
  };

  const hide = () => {
    parts.overlay.classList.remove('is-visible');
  };

  const setTracking = (isTracking) => {
    parts.overlay.classList.toggle('is-tracking', Boolean(isTracking));
  };

  const toggle = (forceOrTarget, maybeTarget) => {
    if (typeof forceOrTarget === 'boolean') {
      if (forceOrTarget) {
        return show(maybeTarget);
      }
      currentTargetInput = null;
      hide();
      return true;
    }

    if (parts.overlay.classList.contains('is-visible')) {
      hide();
      return true;
    }

    return show(forceOrTarget);
  };

  window.addEventListener('resize', requestUpdate);
  window.addEventListener('scroll', requestUpdate, { passive: true });

  window.reviewHighlight = {
    show,
    hide,
    toggle,
    update,
    setTracking,
    paddingX: REVIEW_HIGHLIGHT_PADDING_X,
    paddingTop: REVIEW_HIGHLIGHT_PADDING_TOP,
    fallbackPaddingTop: REVIEW_HIGHLIGHT_FALLBACK_PADDING_TOP,
    paddingBottom: REVIEW_HIGHLIGHT_PADDING_BOTTOM,
    maxWidth: REVIEW_HIGHLIGHT_MAX_WIDTH,
    defaultSelector: REVIEW_HIGHLIGHT_DEFAULT_SELECTOR
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installReviewHighlight, { once: true });
} else {
  installReviewHighlight();
}
