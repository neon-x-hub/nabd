const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const os = require("node:os");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const scenePath = path.resolve(args.scene || "scene.json");
    const scene = JSON.parse(fs.readFileSync(scenePath, "utf8"));
    const [sceneWidth, sceneHeight] = Array.isArray(scene.dimensions) ? scene.dimensions : [1280, 720];

    const fps = Number(args.fps || 30);
    const durationSec = Number(args.duration || 5);
    const frameCount = Math.max(1, Math.ceil(fps * durationSec));
    const quality = clampInt(Number(args.quality || 80), 1, 100);
    const requestedPort = Number(args.port || 5173);
    const pagePath = args.page || "render.html";
    const warmupMs = Number(args.warmup || 0);
    const width = Number(args.width || sceneWidth);
    const height = Number(args.height || sceneHeight);
    const captureSelector = args.captureSelector || "#player-root";
    const fullViewport = args.fullViewport === "true" || args.fullViewport === true;
    const output = path.resolve(args.output || "recordings/output.mp4");
    const headless = args.headless === "true" || args.headless === true;
    const keepFrames = args.keepFrames === "true" || args.keepFrames === true;

    ensureDir(path.dirname(output));
    const framesDir = path.resolve(args.framesDir || path.join(os.tmpdir(), `nabd-frames-${Date.now()}`));
    ensureDir(framesDir);

    const server = createStaticServer(process.cwd());
    const port = await listenServer(server, requestedPort);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless,
            defaultViewport: { width, height },
            args: ["--autoplay-policy=no-user-gesture-required"]
        });
        const page = await browser.newPage();
        const url = new URL(`http://localhost:${port}/${pagePath}`);
        if (pagePath.endsWith("render.html")) {
            url.searchParams.set("autostart", "0");
        }
        await page.goto(url.toString(), { waitUntil: "networkidle0" });
        if (!fullViewport) {
            await page.waitForSelector(captureSelector, { timeout: 10000 });
        }
        await page.waitForFunction(() => window.__nabdRenderReady === true, { timeout: 10000 });
        await page.evaluate(() => {
            if (typeof window.__nabdRun === "function") {
                window.__nabdRun();
            }
        });
        if (warmupMs > 0) {
            await sleep(warmupMs);
        }

        const intervalMs = 1000 / fps;

        let clipWidth = width;
        let clipHeight = height;

        if (!fullViewport) {
            const clip = await getClipFromSelector(page, captureSelector);
            clipWidth = clip.width;
            clipHeight = clip.height;
            // Resize viewport to match the element bounding box exactly
            await page.setViewport({ width: clipWidth, height: clipHeight });
            // Scroll to center/align the element at (0, 0)
            await page.evaluate((x, y) => window.scrollTo(x, y), clip.x, clip.y);
        }

        const client = await page.target().createCDPSession();

        let startTimestamp = null;
        let lastWrittenFrameIndex = -1;
        let activeWrites = 0;
        let lastFrameBuffer = null;
        let rawFrameCount = 0;
        let duplicateCount = 0;
        let gapFillCount = 0;
        let totalCaptureMs = 0;

        const writeFrame = (index, buffer) => {
            activeWrites += 1;
            const framePath = path.join(framesDir, `frame_${String(index).padStart(6, "0")}.jpg`);
            fs.writeFile(framePath, buffer, (err) => {
                activeWrites -= 1;
                if (err) {
                    console.error(`[recorder] failed to write frame ${index}: ${err.message}`);
                }
            });
        };

        client.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
            const captureStart = performance.now();
            rawFrameCount += 1;

            if (startTimestamp === null) {
                startTimestamp = metadata.timestamp;
            }

            const elapsedMs = (metadata.timestamp - startTimestamp) * 1000;
            const targetFrameIndex = Math.round(elapsedMs / intervalMs);

            if (targetFrameIndex >= frameCount) {
                try {
                    await client.send("Page.screencastFrameAck", { sessionId });
                } catch (e) {}
                return;
            }

            const buffer = Buffer.from(data, "base64");
            lastFrameBuffer = buffer;

            // Gap filling: fill gaps with the last known frame
            if (targetFrameIndex > lastWrittenFrameIndex + 1) {
                const gapStart = lastWrittenFrameIndex + 1;
                const gapEnd = targetFrameIndex - 1;
                for (let idx = gapStart; idx <= gapEnd; idx += 1) {
                    if (lastFrameBuffer) {
                        writeFrame(idx, lastFrameBuffer);
                        gapFillCount += 1;
                    }
                }
            }

            if (targetFrameIndex === lastWrittenFrameIndex) {
                duplicateCount += 1;
            }

            writeFrame(targetFrameIndex, buffer);
            lastWrittenFrameIndex = Math.max(lastWrittenFrameIndex, targetFrameIndex);

            totalCaptureMs += performance.now() - captureStart;

            try {
                await client.send("Page.screencastFrameAck", { sessionId });
            } catch (e) {}
        });

        const recordingDurationMs = durationSec * 1000;
        const recordingStarted = performance.now();

        await client.send("Page.startScreencast", {
            format: "jpeg",
            quality,
            maxWidth: clipWidth,
            maxHeight: clipHeight,
            everyNthFrame: 1
        });

        // Let the animation play for the requested duration
        await sleep(recordingDurationMs);

        await client.send("Page.stopScreencast").catch(() => {});

        // Fill any remaining gap at the end to make sure we reach frameCount
        if (lastWrittenFrameIndex < frameCount - 1 && lastFrameBuffer) {
            const gapStart = lastWrittenFrameIndex + 1;
            const gapEnd = frameCount - 1;
            for (let idx = gapStart; idx <= gapEnd; idx += 1) {
                writeFrame(idx, lastFrameBuffer);
                gapFillCount += 1;
            }
        }

        // Wait for all writes to finish
        while (activeWrites > 0) {
            await sleep(50);
        }

        await encodeWithFfmpeg({ fps, framesDir, output });
        if (!keepFrames) {
            fs.rmSync(framesDir, { recursive: true, force: true });
        }

        const avgCapture = (totalCaptureMs / Math.max(1, rawFrameCount)).toFixed(2);
        const wallTime = (performance.now() - recordingStarted).toFixed(2);
        console.log(`[recorder] done`);
        console.log(`[recorder] output: ${output}`);
        console.log(`[recorder] frames: ${frameCount}, fps: ${fps}, wall-clock time: ${wallTime}ms`);
        console.log(`[recorder] raw frames: ${rawFrameCount}, gaps filled: ${gapFillCount}, duplicates/overwrites: ${duplicateCount}, avg process ms: ${avgCapture}`);
    } finally {
        if (browser) {
            await browser.close();
        }
        server.close();
    }
}

function listenServer(server, startPort) {
    const maxAttempts = 20;
    return new Promise((resolve, reject) => {
        let attempts = 0;
        let current = startPort;

        const tryListen = () => {
            attempts += 1;
            const onError = (error) => {
                server.off("listening", onListening);
                if (error && error.code === "EADDRINUSE" && attempts < maxAttempts) {
                    current += 1;
                    tryListen();
                    return;
                }
                reject(error);
            };
            const onListening = () => {
                server.off("error", onError);
                resolve(current);
            };
            server.once("error", onError);
            server.once("listening", onListening);
            server.listen(current);
        };

        tryListen();
    });
}

function parseArgs(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith("--")) continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
            out[key] = true;
            continue;
        }
        out[key] = next;
        i += 1;
    }
    return out;
}

function createStaticServer(rootDir) {
    return http.createServer((req, res) => {
        const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);
        const relPath = rawPath === "/" ? "/index.html" : rawPath;
        const absPath = path.normalize(path.join(rootDir, relPath));
        if (!absPath.startsWith(path.normalize(rootDir))) {
            res.statusCode = 403;
            res.end("Forbidden");
            return;
        }

        fs.readFile(absPath, (err, content) => {
            if (err) {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            res.setHeader("Content-Type", contentType(absPath));
            res.end(content);
        });
    });
}

function contentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".mp4": "video/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".woff": "font/woff",
        ".woff2": "font/woff2"
    };
    return map[ext] || "application/octet-stream";
}

function encodeWithFfmpeg({ fps, framesDir, output }) {
    return new Promise((resolve, reject) => {
        const inputPattern = path.join(framesDir, "frame_%06d.jpg");
        const args = [
            "-y",
            "-framerate",
            String(fps),
            "-i",
            inputPattern,
            "-vf",
            "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            output
        ];

        const child = spawn("ffmpeg", args, { stdio: "inherit" });
        child.on("error", (error) => {
            reject(new Error(`Failed to start ffmpeg: ${error.message}`));
        });
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        });
    });
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function clampInt(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, Math.round(value)));
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

async function getClipFromSelector(page, selector) {
    const box = await page.$eval(selector, (el) => {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    });

    if (!box || box.width <= 0 || box.height <= 0) {
        throw new Error(`Invalid capture area from selector: ${selector}`);
    }

    return {
        x: Math.max(0, Math.floor(box.x)),
        y: Math.max(0, Math.floor(box.y)),
        width: Math.max(2, Math.floor(box.width)),
        height: Math.max(2, Math.floor(box.height))
    };
}

main().catch((error) => {
    console.error(`[recorder] failed: ${error.message}`);
    process.exit(1);
});
