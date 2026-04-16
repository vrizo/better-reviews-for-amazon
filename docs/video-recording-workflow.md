# Video Recording Workflow

Use this workflow when you need to capture a short product demo video from the mockup page.

## Current output

The current recorded file in this repo is:

- `docs/better-reviews-demo.webm`

Its current properties were checked with `ffprobe`:

- container: `webm`
- video codec: `vp9`
- resolution: `2628x1292`

This resolution depends on the captured tab and browser environment.
It is not a marketplace screenshot size.

## Marketplace fit

This video file is not a direct marketplace asset for the current store plan.

- Chrome Web Store notes in this repo mention screenshots, not uploaded video files.
- Firefox Add-ons notes in this repo mention screenshots, not uploaded video files.
- Microsoft Edge Add-ons notes in this repo mention an optional YouTube video URL, not a direct `webm` upload.

So this recording is useful as:

- a demo clip for product notes
- a source file for later editing
- a source for converting to another format

It is not a replacement for the `1280x800` screenshots required by the stores.

## Record a new video

1. Start the local preview server if it is not already running.
2. Open `http://127.0.0.1:8765/store-screenshot-wireframe-active.html`.
3. Click `Record Demo`.
4. In the browser share dialog, choose the current browser tab.
5. Let the scene finish once.
6. The page will download a new `better-reviews-demo.webm` file.

## Scene summary

The current recorded scene runs once and then returns to the initial state:

1. wait `1000ms`
2. show highlight
3. wait `500ms`
4. zoom in
5. wait `500ms`
6. show plugin mockup
7. wait `1500ms`
8. zoom out
9. hide highlight
10. wait `500ms`
11. hide plugin mockup

## Check the video

Use this command to inspect the video:

```bash
ffprobe -v error \
  -show_entries stream=codec_name,width,height,r_frame_rate,duration \
  -show_entries format=format_name,duration,size \
  -of json docs/better-reviews-demo.webm
```

## Convert to MP4

Use this command to convert the current recording to MP4:

```bash
ffmpeg -i docs/better-reviews-demo.webm \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  docs/better-reviews-demo.mp4
```

## Optional resize for editors

If you need a smaller MP4 for editing or review, convert and scale in one step:

```bash
ffmpeg -i docs/better-reviews-demo.webm \
  -vf "scale=1280:-2" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  docs/better-reviews-demo-1280w.mp4
```

This keeps aspect ratio.
It does not make the file a valid marketplace screenshot asset.

## Notes for agents

- Keep documentation in simple English.
- Do not treat the video as a screenshot replacement for store submissions.
- Prefer `webm` capture from the page recorder, then convert with `ffmpeg` only if needed.
- If the browser does not offer the current tab in the share dialog, retry in another browser.
- If Firefox fails to save the file, wait until the scene fully ends before testing another capture.
