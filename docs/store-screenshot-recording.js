const RECORDING_OUTPUT_BASENAME = 'better-reviews-demo';

function installRecordingController() {
  const button = document.getElementById('record-demo-button');
  const status = document.getElementById('recording-status');
  if (!button || !status) {
    return;
  }

  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const nextFrame = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  const pickMimeType = () => {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const setStatus = (text) => {
    status.textContent = text;
  };

  const downloadBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const extension = blob.type.includes('webm') ? 'webm' : 'bin';
    anchor.href = url;
    anchor.download = `${RECORDING_OUTPUT_BASENAME}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const ensureIdleScene = async () => {
    if (window.reviewPlugin && typeof window.reviewPlugin.hide === 'function') {
      window.reviewPlugin.hide();
    }

    if (window.reviewHighlight && typeof window.reviewHighlight.hide === 'function') {
      window.reviewHighlight.hide();
    }

    const shell = document.getElementById('page-shell');
    if (shell) {
      shell.style.transform = '';
      shell.style.transition = '';
      shell.style.transformOrigin = '';
      shell.style.willChange = '';
    }

    await wait(80);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia || !window.reviewScene?.playOnce) {
      setStatus('Recording is not available in this browser.');
      return;
    }

    button.disabled = true;
    setStatus('Choose this browser tab in the share dialog.');

    let stream;

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
        monitorTypeSurfaces: 'exclude',
        video: {
          frameRate: 60
        },
        audio: false
      });
    } catch (error) {
      button.disabled = false;
      setStatus('Recording was cancelled.');
      return;
    }

    const mimeType = pickMimeType();
    const chunks = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const stopPromise = new Promise((resolve) => {
      recorder.addEventListener('stop', resolve, { once: true });
    });

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    const [videoTrack] = stream.getVideoTracks();
    if (videoTrack) {
      videoTrack.addEventListener(
        'ended',
        () => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        },
        { once: true }
      );
    }

    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
      downloadBlob(blob);
      stream.getTracks().forEach((track) => track.stop());
      document.body.classList.remove('is-recording-demo');
      button.disabled = false;
      setStatus('Recording saved.');
    });

    await ensureIdleScene();

    document.body.classList.add('is-recording-demo');
    await nextFrame();
    await nextFrame();

    setStatus('Recording…');
    recorder.start(250);

    await wait(120);
    await window.reviewScene.playOnce();
    await wait(220);

    if (recorder.state !== 'inactive') {
      recorder.requestData();
      recorder.stop();
    }

    await stopPromise;
  };

  button.addEventListener('click', () => {
    startRecording().catch((error) => {
      document.body.classList.remove('is-recording-demo');
      button.disabled = false;
      setStatus('Recording failed.');
      console.error('[store-screenshot-recording]', error);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installRecordingController, { once: true });
} else {
  installRecordingController();
}
