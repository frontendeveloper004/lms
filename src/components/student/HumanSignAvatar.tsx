"use client";

import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Hand, Loader2, ChevronRight } from "lucide-react";
import type { TimedSign } from "@/lib/asl-service";

interface HandPose {
  lx: number; ly: number; lr: number; lopen: boolean;
  rx: number; ry: number; rr: number; ropen: boolean;
  headTilt?: number; 
}

const POSES: Record<string, HandPose> = {
  
  idle:         { lx:32, ly:78, lr:  0, lopen:false, rx:68, ry:78, rr:  0, ropen:false, headTilt: 0 },
  hello:        { lx:32, ly:78, lr:  0, lopen:false, rx:72, ry:38, rr:-20, ropen:true,  headTilt: 5 },
  learn:        { lx:22, ly:52, lr: 15, lopen:true,  rx:78, ry:52, rr:-15, ropen:true,  headTilt: 0 },
  understand:   { lx:32, ly:78, lr:  0, lopen:false, rx:65, ry:45, rr: 10, ropen:false, headTilt:-4 },
  yes:          { lx:32, ly:78, lr:  0, lopen:false, rx:62, ry:55, rr: 30, ropen:false, headTilt: 8 },
  no:           { lx:32, ly:78, lr:  0, lopen:false, rx:75, ry:58, rr:-40, ropen:true,  headTilt:-8 },
  good:         { lx:32, ly:78, lr:  0, lopen:false, rx:68, ry:48, rr:-10, ropen:false, headTilt: 5 },
  watch:        { lx:25, ly:55, lr: 10, lopen:false, rx:75, ry:55, rr:-10, ropen:false, headTilt: 0 },
  think:        { lx:32, ly:78, lr:  0, lopen:false, rx:60, ry:42, rr: 15, ropen:false, headTilt:-5 },
  work:         { lx:28, ly:60, lr: 20, lopen:false, rx:72, ry:60, rr:-20, ropen:false, headTilt: 4 },
  question:     { lx:32, ly:78, lr:  0, lopen:false, rx:68, ry:42, rr:-30, ropen:true,  headTilt:10 },
  show:         { lx:32, ly:78, lr:  0, lopen:false, rx:78, ry:55, rr:-45, ropen:true,  headTilt: 3 },
  change:       { lx:25, ly:58, lr: 25, lopen:false, rx:75, ry:58, rr:-25, ropen:false, headTilt: 2 },
  different:    { lx:20, ly:55, lr: 45, lopen:true,  rx:80, ry:55, rr:-45, ropen:true,  headTilt: 0 },
  important:    { lx:32, ly:78, lr:  0, lopen:false, rx:62, ry:40, rr: 20, ropen:false, headTilt:-6 },
  two_up:       { lx:22, ly:42, lr: 10, lopen:true,  rx:78, ry:42, rr:-10, ropen:true,  headTilt: 5 },
  thank:        { lx:32, ly:78, lr:  0, lopen:false, rx:62, ry:52, rr: 15, ropen:false, headTilt: 6 },
  wave:         { lx:32, ly:78, lr:  0, lopen:false, rx:74, ry:36, rr:-25, ropen:true,  headTilt: 8 },
  practice:     { lx:26, ly:58, lr: 18, lopen:false, rx:74, ry:58, rr:-18, ropen:false, headTilt: 3 },
  example:      { lx:32, ly:78, lr:  0, lopen:false, rx:72, ry:50, rr:-15, ropen:false, headTilt: 3 },
  read:         { lx:24, ly:56, lr: 12, lopen:false, rx:76, ry:56, rr:-12, ropen:false, headTilt: 0 },
  easy:         { lx:32, ly:78, lr:  0, lopen:false, rx:70, ry:48, rr:-12, ropen:false, headTilt: 5 },
  store:        { lx:26, ly:60, lr: 15, lopen:false, rx:74, ry:60, rr:-15, ropen:false, headTilt: 0 },
  use:          { lx:32, ly:78, lr:  0, lopen:false, rx:66, ry:52, rr: 10, ropen:false, headTilt: 2 },
  name:         { lx:26, ly:58, lr: 12, lopen:false, rx:74, ry:58, rr:-12, ropen:false, headTilt: 0 },
  new:          { lx:32, ly:78, lr:  0, lopen:false, rx:70, ry:46, rr:-10, ropen:false, headTilt: 3 },
  same:         { lx:32, ly:78, lr:  0, lopen:false, rx:72, ry:56, rr:-35, ropen:true,  headTilt: 0 },
  remember:     { lx:32, ly:78, lr:  0, lopen:false, rx:60, ry:42, rr: 18, ropen:false, headTilt:-4 },
  today:        { lx:32, ly:78, lr:  0, lopen:false, rx:66, ry:54, rr: 12, ropen:false, headTilt: 2 },
  time:         { lx:32, ly:78, lr:  0, lopen:false, rx:64, ry:52, rr: 20, ropen:false, headTilt: 0 },
  next:         { lx:32, ly:78, lr:  0, lopen:false, rx:76, ry:54, rr:-40, ropen:true,  headTilt: 2 },
  why:          { lx:32, ly:78, lr:  0, lopen:false, rx:64, ry:44, rr:-25, ropen:true,  headTilt:10 },
  how:          { lx:24, ly:54, lr: 20, lopen:false, rx:76, ry:54, rr:-20, ropen:false, headTilt: 8 },
  make:         { lx:26, ly:58, lr: 15, lopen:false, rx:74, ry:58, rr:-15, ropen:false, headTilt: 2 },
  type:         { lx:24, ly:62, lr: 10, lopen:false, rx:76, ry:62, rr:-10, ropen:false, headTilt: 0 },
  print:        { lx:24, ly:62, lr: 10, lopen:false, rx:76, ry:62, rr:-10, ropen:false, headTilt: 0 },
  see:          { lx:32, ly:78, lr:  0, lopen:false, rx:68, ry:46, rr:-15, ropen:true,  headTilt: 0 },
  value:        { lx:32, ly:78, lr:  0, lopen:false, rx:70, ry:50, rr:-12, ropen:false, headTilt: 2 },
  equal:        { lx:24, ly:58, lr: 10, lopen:false, rx:76, ry:58, rr:-10, ropen:false, headTilt: 0 },
  five:         { lx:32, ly:78, lr:  0, lopen:false, rx:68, ry:44, rr:-10, ropen:true,  headTilt: 2 },
  number:       { lx:32, ly:78, lr:  0, lopen:false, rx:66, ry:52, rr: 15, ropen:false, headTilt: 0 },
};

function glossToPoseName(gloss: string): string {
  const g = gloss.toLowerCase().trim();
  if (POSES[g]) return g;
  if (["hello","hi","welcome","greet"].some(w => g.includes(w))) return "hello";
  if (["learn","study","education","lesson","course"].some(w => g.includes(w))) return "learn";
  if (["understand","know","comprehend"].some(w => g.includes(w))) return "understand";
  if (["yes","correct","right","true"].some(w => g.includes(w))) return "yes";
  if (["no","not","wrong","false"].some(w => g.includes(w))) return "no";
  if (["good","great","nice","well"].some(w => g.includes(w))) return "good";
  if (["watch","see","look","view"].some(w => g.includes(w))) return "watch";
  if (["think","mind","idea","brain"].some(w => g.includes(w))) return "think";
  if (["work","code","program","computer"].some(w => g.includes(w))) return "work";
  if (["question","ask","why","how"].some(w => g.includes(w))) return "question";
  if (["show","point","that","there"].some(w => g.includes(w))) return "show";
  if (["name","call","title"].some(w => g.includes(w))) return "name";
  if (["change","different","vary"].some(w => g.includes(w))) return "change";
  if (["new","create","make"].some(w => g.includes(w))) return "new";
  if (["same","equal","match"].some(w => g.includes(w))) return "same";
  if (["important","key","main"].some(w => g.includes(w))) return "important";
  if (["remember","recall","memory"].some(w => g.includes(w))) return "remember";
  if (["use","apply","run"].some(w => g.includes(w))) return "use";
  if (["practice","try","test"].some(w => g.includes(w))) return "practice";
  if (["example","demo","sample"].some(w => g.includes(w))) return "example";
  if (["print","output","display"].some(w => g.includes(w))) return "print";
  if (["read","text","string"].some(w => g.includes(w))) return "read";
  if (["easy","simple","basic"].some(w => g.includes(w))) return "easy";
  if (["thank","bye","goodbye"].some(w => g.includes(w))) return "thank";
  if (["today","now","start","begin"].some(w => g.includes(w))) return "today";
  if (["time","when","hour"].some(w => g.includes(w))) return "time";
  if (["next","after","then"].some(w => g.includes(w))) return "next";
  if (["wave"].some(w => g.includes(w))) return "wave";
  if (["type","write","input"].some(w => g.includes(w))) return "type";
  if (["store","save","keep"].some(w => g.includes(w))) return "store";
  if (["value","number","data"].some(w => g.includes(w))) return "value";
  if (["two","both","up"].some(w => g.includes(w))) return "two_up";
  return "idle";
}

const HandSVG: React.FC<{ open: boolean; flip?: boolean; size?: number }> = ({
  open, flip = false, size = 44,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 44 44"
    style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
  >
    <defs>
      <radialGradient id={`hg${flip ? "r" : "l"}`} cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#FDDBB4" />
        <stop offset="100%" stopColor="#E8A87C" />
      </radialGradient>
    </defs>
    {open ? (
      
      <g fill={`url(#hg${flip ? "r" : "l"})`} stroke="#D4956A" strokeWidth="0.6">

        <ellipse cx="22" cy="30" rx="11" ry="10" />

        <ellipse cx="8" cy="26" rx="4.5" ry="7" transform="rotate(-30 8 26)" />

        <ellipse cx="13" cy="14" rx="3.5" ry="8" transform="rotate(-8 13 14)" />

        <ellipse cx="20" cy="11" rx="3.5" ry="9" />

        <ellipse cx="27" cy="12" rx="3.5" ry="8.5" transform="rotate(6 27 12)" />

        <ellipse cx="34" cy="16" rx="3" ry="7" transform="rotate(14 34 16)" />

        <rect x="13" y="36" width="18" height="8" rx="4" />
      </g>
    ) : (
      
      <g fill={`url(#hg${flip ? "r" : "l"})`} stroke="#D4956A" strokeWidth="0.6">

        <rect x="10" y="16" width="24" height="18" rx="6" />

        <line x1="16" y1="16" x2="16" y2="22" stroke="#D4956A" strokeWidth="0.8" />
        <line x1="22" y1="15" x2="22" y2="21" stroke="#D4956A" strokeWidth="0.8" />
        <line x1="28" y1="16" x2="28" y2="22" stroke="#D4956A" strokeWidth="0.8" />

        <ellipse cx="8" cy="22" rx="4" ry="6" transform="rotate(-20 8 22)" />

        <rect x="13" y="32" width="18" height="8" rx="4" />
      </g>
    )}
  </svg>
);

const ArmAndHand: React.FC<{
  x: number; y: number; rot: number; open: boolean;
  flip?: boolean; cardW: number; cardH: number;
}> = ({ x, y, rot, open, flip = false, cardW, cardH }) => {
  const px = (x / 100) * cardW;
  const py = (y / 100) * cardH;
  
  const armStartX = flip ? cardW * 0.65 : cardW * 0.35;
  const armStartY = cardH + 10;

  return (
    <motion.g
      animate={{ x: px - (flip ? cardW * 0.65 : cardW * 0.35), y: py - (cardH + 10) }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >

      <line
        x1={armStartX} y1={armStartY}
        x2={px} y2={py}
        stroke="#E8A87C" strokeWidth="14" strokeLinecap="round"
      />

      <ellipse
        cx={armStartX} cy={armStartY - 4}
        rx="9" ry="6"
        fill="#6B7280" stroke="#4B5563" strokeWidth="0.5"
      />

      <foreignObject
        x={px - 22} y={py - 22}
        width="44" height="44"
        style={{ overflow: "visible" }}
      >
        <HandSVG open={open} flip={flip} size={44} />
      </foreignObject>
    </motion.g>
  );
};

const FingerspellBubble: React.FC<{ word: string }> = ({ word }) => {
  const letters = word.replace(/[^a-zA-Z]/g, "").toUpperCase().split("");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
    if (letters.length <= 1) return;
    const iv = setInterval(() => setIdx(p => {
      if (p >= letters.length - 1) { clearInterval(iv); return p; }
      return p + 1;
    }), 420);
    return () => clearInterval(iv);
  }, [word]); 
  const letter = (letters[idx] || "A").toLowerCase();
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/70 border border-blue-400/40 flex items-center justify-center">

        <img key={letter}
          src={`https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/${letter}.gif`}
          alt={`ASL ${letter.toUpperCase()}`}
          className="w-full h-full object-contain p-1"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-[7px] font-black text-white">{letter.toUpperCase()}</span>
        </div>
      </div>
      <div className="flex gap-0.5 flex-wrap justify-center max-w-[68px]">
        {letters.map((_, i) => (
          <div key={i} className={`w-1 h-1 rounded-full transition-all duration-150 ${
            i === idx ? "bg-blue-400 scale-125" : i < idx ? "bg-blue-700" : "bg-white/15"}`} />
        ))}
      </div>
    </div>
  );
};

const SignGifBubble: React.FC<{ gloss: string; gifUrl: string }> = ({ gloss, gifUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { setLoaded(false); setError(false); }, [gifUrl]);
  return (
    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/70 border border-blue-400/40 flex items-center justify-center">
      {!error ? (
        <>
          {!loaded && <Loader2 className="w-3 h-3 text-blue-400 animate-spin absolute" />}

          <img key={gifUrl} src={gifUrl} alt={`ASL ${gloss}`}
            className={`w-full h-full object-contain p-1 transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)} onError={() => setError(true)} />
        </>
      ) : <Hand className="w-4 h-4 text-blue-400" />}
    </div>
  );
};

export interface HumanSignAvatarProps {
  signs: TimedSign[];
  videoTime: number;
  isVisible: boolean;
  isLoading?: boolean;
}

const CARD_W = 170;
const CARD_H = 260;

export const HumanSignAvatar: React.FC<HumanSignAvatarProps> = ({
  signs, videoTime, isVisible, isLoading = false,
}) => {
  
  const activeSign = useMemo<TimedSign | null>(() => {
    if (!signs.length) return null;
    const exact = signs.find(s => videoTime >= s.start && videoTime < s.end);
    if (exact) return exact;
    const passed = signs.filter(s => s.end <= videoTime);
    return passed.length > 0 ? passed[passed.length - 1] : null;
  }, [signs, videoTime]);

  const [displaySign, setDisplaySign] = useState<TimedSign | null>(null);
  const prevRef = useRef("");
  useEffect(() => {
    if (!activeSign || activeSign.gloss === prevRef.current) return;
    prevRef.current = activeSign.gloss;
    setDisplaySign(activeSign);
  }, [activeSign]);

  const poseName = useMemo(() =>
    displaySign ? glossToPoseName(displaySign.gloss) : "idle", [displaySign]);
  const pose = POSES[poseName] ?? POSES.idle;

  const progress = useMemo(() => {
    if (!displaySign) return 0;
    const dur = displaySign.end - displaySign.start;
    return dur > 0 ? Math.min(100, Math.max(0, ((videoTime - displaySign.start) / dur) * 100)) : 100;
  }, [displaySign, videoTime]);

  const nextSign = useMemo(() =>
    displaySign ? signs.find(s => s.start >= displaySign.end) ?? null : null,
    [displaySign, signs]);

  const isActive = !isLoading && !!displaySign;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.92 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
          className="absolute bottom-0 left-3 z-[9999] pointer-events-none select-none flex flex-col items-start"
        >

          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/25"
            style={{ width: CARD_W, height: CARD_H }}
          >

            <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200" />

            <motion.div
              className="absolute inset-0"
              animate={{ rotate: pose.headTilt ?? 0 }}
              style={{ originX: "50%", originY: "30%" }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Image
                src="/assets/ai-avatar.png"
                alt="ASL Interpreter"
                fill
                className="object-cover object-top"
                priority
              />
            </motion.div>

            {!isLoading && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${CARD_W} ${CARD_H}`}
                style={{ overflow: "visible" }}
              >

                <motion.g
                  animate={{
                    x: (pose.lx / 100) * CARD_W - CARD_W * 0.35,
                    y: (pose.ly / 100) * CARD_H - (CARD_H + 10),
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >

                  <line
                    x1={CARD_W * 0.35} y1={CARD_H + 10}
                    x2={(pose.lx / 100) * CARD_W} y2={(pose.ly / 100) * CARD_H}
                    stroke="#9CA3AF" strokeWidth="16" strokeLinecap="round"
                  />
                  <ellipse
                    cx={CARD_W * 0.35} cy={CARD_H + 6}
                    rx="10" ry="7" fill="#6B7280"
                  />
                </motion.g>

                <motion.g
                  animate={{
                    x: (pose.rx / 100) * CARD_W - CARD_W * 0.65,
                    y: (pose.ry / 100) * CARD_H - (CARD_H + 10),
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <line
                    x1={CARD_W * 0.65} y1={CARD_H + 10}
                    x2={(pose.rx / 100) * CARD_W} y2={(pose.ry / 100) * CARD_H}
                    stroke="#9CA3AF" strokeWidth="16" strokeLinecap="round"
                  />
                  <ellipse
                    cx={CARD_W * 0.65} cy={CARD_H + 6}
                    rx="10" ry="7" fill="#6B7280"
                  />
                </motion.g>
              </svg>
            )}

            {!isLoading && (
              <>

                <motion.div
                  className="absolute"
                  animate={{
                    left: `${pose.lx}%`,
                    top: `${pose.ly}%`,
                    rotate: pose.lr,
                    x: "-50%",
                    y: "-50%",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <HandSVG open={pose.lopen} flip={false} size={46} />
                </motion.div>

                <motion.div
                  className="absolute"
                  animate={{
                    left: `${pose.rx}%`,
                    top: `${pose.ry}%`,
                    rotate: pose.rr,
                    x: "-50%",
                    y: "-50%",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <HandSVG open={pose.ropen} flip={true} size={46} />
                </motion.div>
              </>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-sm">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
                <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">
                  Tayyorlanmoqda...
                </p>
              </div>
            )}

            <div className="absolute top-2.5 left-2.5 z-20">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/15">
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">
                  {isLoading ? "Loading" : isActive ? "Signing" : "ASL"}
                </span>
              </div>
            </div>

            <div className="absolute top-2.5 right-2.5 z-20">
              <AnimatePresence mode="wait">
                {!isLoading && displaySign && (
                  <motion.div key={displaySign.gloss}
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }}>
                    {displaySign.type === "fingerspell"
                      ? <FingerspellBubble word={displaySign.gloss} />
                      : displaySign.payload
                        ? <SignGifBubble gloss={displaySign.gloss} gifUrl={displaySign.payload} />
                        : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8 z-20"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.75) 55%,transparent)" }}
            >
              {displaySign && !isLoading ? (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <AnimatePresence mode="wait">
                      <motion.p key={displaySign.gloss}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                        className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                        {displaySign.gloss}
                      </motion.p>
                    </AnimatePresence>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-[7px] font-black text-blue-300 uppercase">LIVE</span>
                    </div>
                  </div>
                  <div className="h-0.5 rounded-full bg-white/15 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                      style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
                  </div>
                  {nextSign && (
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronRight className="w-2.5 h-2.5 text-white/25 shrink-0" />
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest truncate">
                        {nextSign.gloss}
                      </p>
                    </div>
                  )}
                </>
              ) : !isLoading ? (
                <p className="text-[9px] text-white/30 font-bold text-center uppercase tracking-widest">
                  Video boshlang
                </p>
              ) : null}
            </div>
          </div>

          {signs.length > 0 && !isLoading && (
            <div className="mt-1.5 ml-1">
              <span className="text-[8px] text-white/25 font-bold bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {signs.length} belgi
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
