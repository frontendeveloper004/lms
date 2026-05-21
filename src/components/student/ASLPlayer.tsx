"use client";

/**
 * ASLPlayer — Real-time ASL skeleton avatar overlay.
 *
 * Rendering:
 *  - type="pose"        → draws skeleton keypoints on <canvas> (from Python service)
 *  - type="fingerspell" → Lifeprint fingerspelling GIFs
 *  - type="clip"        → Lifeprint word GIFs
 *
 * The skeleton is drawn as a stick-figure with:
 *  - Body connections (shoulders, arms, torso)
 *  - Hand keypoints (fingers)
 *  - Face outline
 */

import React, {
  useEffect, useRef, useState, useMemo, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Loader2, ChevronRight, AlertCircle } from "lucide-react";
import type { TimedSign } from "@/lib/asl-service";
import { getFingerspellUrl } from "@/lib/asl-client-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PoseFrame {
  timestamp: number;
  keypoints: number[][];  // [x, y, z?] per keypoint
  word?: string;
}

interface PoseSign extends TimedSign {
  type: "pose";
  frames: PoseFrame[];
}

type AnySign = TimedSign | PoseSign;

interface ASLPlayerProps {
  signs: AnySign[];
  videoTime: number;
  isVisible: boolean;
  isLoading?: boolean;
  serviceDown?: boolean;
}

// ─── Skeleton connections (MediaPipe Holistic / Pose format) ──────────────────
// Indices based on standard 17-keypoint pose (COCO format)
const POSE_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2],           // nose → eyes
  [1, 3], [2, 4],           // eyes → ears
  [5, 6],                   // shoulders
  [5, 7], [7, 9],           // left arm
  [6, 8], [8, 10],          // right arm
  [5, 11], [6, 12],         // torso sides
  [11, 12],                 // hips
  [11, 13], [13, 15],       // left leg
  [12, 14], [14, 16],       // right leg
];

const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],       // thumb
  [0,5],[5,6],[6,7],[7,8],       // index
  [0,9],[9,10],[10,11],[11,12],  // middle
  [0,13],[13,14],[14,15],[15,16],// ring
  [0,17],[17,18],[18,19],[19,20],// pinky
  [5,9],[9,13],[13,17],          // palm
];

// ─── Canvas skeleton renderer ─────────────────────────────────────────────────

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: number[][],
  w: number,
  h: number,
  color: string = "#60a5fa",
  connections: [number, number][] = POSE_CONNECTIONS,
) {
  if (!keypoints || keypoints.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.lineCap     = "round";

  // Draw connections
  for (const [a, b] of connections) {
    const kpA = keypoints[a];
    const kpB = keypoints[b];
    if (!kpA || !kpB) continue;
    ctx.beginPath();
    ctx.moveTo(kpA[0] * w, kpA[1] * h);
    ctx.lineTo(kpB[0] * w, kpB[1] * h);
    ctx.stroke();
  }

  // Draw joints
  ctx.fillStyle = "#fff";
  for (const kp of keypoints) {
    if (!kp) continue;
    ctx.beginPath();
    ctx.arc(kp[0] * w, kp[1] * h, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

// ─── Skeleton Canvas component ────────────────────────────────────────────────

const SkeletonCanvas: React.FC<{ frames: PoseFrame[]; videoTime: number; start: number; end: number }> = ({
  frames, videoTime, start, end,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentFrame = useMemo(() => {
    if (!frames || frames.length === 0) return null;
    const relTime = videoTime - start;
    const duration = end - start;
    // Loop frames within the sign window
    const loopTime = duration > 0 ? relTime % duration : relTime;
    // Find closest frame
    let closest = frames[0];
    let minDiff = Infinity;
    for (const f of frames) {
      const diff = Math.abs(f.timestamp - loopTime);
      if (diff < minDiff) { minDiff = diff; closest = f; }
    }
    return closest;
  }, [frames, videoTime, start, end]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!currentFrame) {
      // Draw idle pose
      ctx.fillStyle = "rgba(96,165,250,0.15)";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 20, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const kps = currentFrame.keypoints;

    // Determine if this looks like a full body pose (17+ kps) or hand (21 kps)
    if (kps.length >= 17) {
      drawSkeleton(ctx, kps, w, h, "#60a5fa", POSE_CONNECTIONS);
    } else if (kps.length >= 21) {
      drawSkeleton(ctx, kps, w, h, "#34d399", HAND_CONNECTIONS);
    } else {
      // Generic: just draw points
      ctx.fillStyle = "#60a5fa";
      for (const kp of kps) {
        ctx.beginPath();
        ctx.arc(kp[0] * w, kp[1] * h, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [currentFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={112}
      height={112}
      className="rounded-2xl"
      style={{ background: "rgba(15,23,42,0.6)" }}
    />
  );
};

// ─── Fingerspell component ────────────────────────────────────────────────────

const FingerspellDisplay: React.FC<{ word: string }> = ({ word }) => {
  const letters = word.replace(/[^a-zA-Z]/g, "").toUpperCase().split("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (letters.length <= 1) return;
    const iv = setInterval(() => {
      setIdx((p) => {
        if (p >= letters.length - 1) { clearInterval(iv); return p; }
        return p + 1;
      });
    }, 450);
    return () => clearInterval(iv);
  }, [word]); // eslint-disable-line

  const letter = (letters[idx] || "A").toLowerCase();

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: "rgba(15,23,42,0.6)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={letter}
          src={`https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/${letter}.gif`}
          alt={`ASL ${letter.toUpperCase()}`}
          className="w-full h-full object-contain p-2"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-[9px] font-black text-white">{letter.toUpperCase()}</span>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap justify-center max-w-[140px]">
        {letters.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all duration-200 ${
            i === idx ? "bg-blue-400 scale-125" : i < idx ? "bg-blue-800" : "bg-slate-700"
          }`} />
        ))}
      </div>
      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">{word}</p>
    </div>
  );
};

// ─── GIF sign component ───────────────────────────────────────────────────────

const GifDisplay: React.FC<{ gloss: string }> = ({ gloss }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  const url = `https://www.lifeprint.com/asl101/gifs/${gloss.toLowerCase()}.gif`;

  useEffect(() => { setLoaded(false); setError(false); }, [gloss]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: "rgba(15,23,42,0.6)" }}>
        {!error ? (
          <>
            {!loaded && <Loader2 className="w-5 h-5 text-blue-400 animate-spin absolute" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={url}
              src={url}
              alt={`ASL ${gloss}`}
              className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Hand className="w-8 h-8 text-blue-400" />
            <span className="text-[9px] font-black text-blue-300 uppercase text-center px-1">{gloss}</span>
          </div>
        )}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-blue-500/40 pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <p className="text-sm font-black text-white uppercase tracking-wide">{gloss}</p>
    </div>
  );
};

// ─── Main ASLPlayer ───────────────────────────────────────────────────────────

export const ASLPlayer: React.FC<ASLPlayerProps> = ({
  signs,
  videoTime,
  isVisible,
  isLoading = false,
  serviceDown = false,
}) => {
  const activeSign = useMemo<AnySign | null>(() => {
    if (!signs || signs.length === 0) return null;
    const exact = signs.find((s) => videoTime >= s.start && videoTime < s.end);
    if (exact) return exact;
    const passed = signs.filter((s) => s.end <= videoTime);
    return passed.length > 0 ? passed[passed.length - 1] : null;
  }, [signs, videoTime]);

  const [displaySign, setDisplaySign] = useState<AnySign | null>(null);
  const prevRef = useRef<string>("");

  useEffect(() => {
    if (!activeSign || activeSign.gloss === prevRef.current) return;
    prevRef.current = activeSign.gloss;
    setDisplaySign(activeSign);
  }, [activeSign]);

  const progress = useMemo(() => {
    if (!displaySign) return 0;
    const total = displaySign.end - displaySign.start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((videoTime - displaySign.start) / total) * 100));
  }, [displaySign, videoTime]);

  const nextSign = useMemo(() => {
    if (!displaySign) return null;
    return signs.find((s) => s.start >= displaySign.end) ?? null;
  }, [displaySign, signs]);

  const upcoming = useMemo(() =>
    signs.filter((s) => s.start > videoTime).slice(0, 3),
    [signs, videoTime]
  );

  const renderSignContent = useCallback((sign: AnySign) => {
    if ((sign as PoseSign).type === "pose" && (sign as PoseSign).frames?.length > 0) {
      return (
        <div className="flex flex-col items-center gap-2 w-full">
          <SkeletonCanvas
            frames={(sign as PoseSign).frames}
            videoTime={videoTime}
            start={sign.start}
            end={sign.end}
          />
          <p className="text-sm font-black text-white uppercase tracking-wide">{sign.gloss}</p>
        </div>
      );
    }
    if (sign.type === "fingerspell") return <FingerspellDisplay word={sign.gloss} />;
    return <GifDisplay gloss={sign.gloss} />;
  }, [videoTime]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 180 }}
          className="absolute bottom-4 left-4 z-[9999] w-52 pointer-events-auto select-none"
        >
          <div
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Hand className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">ASL</p>
                  <p className="text-[8px] text-blue-300 font-bold leading-none mt-0.5">Sign Language</p>
                </div>
              </div>
              {serviceDown ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                  <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                  <span className="text-[8px] font-black text-red-300 uppercase">OFFLINE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">LIVE</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-4 py-4 min-h-[160px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  </div>
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest text-center">
                    AI tayyorlamoqda...
                  </p>
                </div>
              ) : serviceDown ? (
                <div className="flex flex-col items-center gap-3 text-center px-2">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-[10px] font-bold text-red-300 leading-relaxed">
                    Sign service ishlamayapti.
                  </p>
                  <code className="text-[8px] text-slate-400 bg-black/30 px-2 py-1 rounded-lg">
                    python sign-service/app.py
                  </code>
                </div>
              ) : !displaySign ? (
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <Hand className="w-6 h-6 text-white/30" />
                  </motion.div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-center">
                    Video boshlang
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displaySign.gloss}
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    transition={{ duration: 0.18, type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full flex flex-col items-center"
                  >
                    {renderSignContent(displaySign)}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Progress bar */}
            {displaySign && !isLoading && !serviceDown && (
              <div className="px-4 pb-1">
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            )}

            {/* Next sign */}
            {nextSign && !isLoading && !serviceDown && (
              <div className="px-4 py-2 flex items-center gap-1.5 border-t border-white/5">
                <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest truncate">
                  {nextSign.gloss}
                </p>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && !isLoading && !serviceDown && displaySign && (
              <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
                {upcoming.map((s, i) => (
                  <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {s.gloss}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sign count */}
          {signs.length > 0 && !isLoading && !serviceDown && (
            <div className="mt-1.5 flex justify-center">
              <span className="text-[9px] text-white/30 font-bold bg-black/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                {signs.length} belgi
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
