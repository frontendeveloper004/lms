"use client";

import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ArmPose {
  leftElbow:  { x: number; y: number };
  leftWrist:  { x: number; y: number };
  rightElbow: { x: number; y: number };
  rightWrist: { x: number; y: number };
  headTilt?: number;
}

const SIGN_POSES: Record<string, ArmPose> = {
  idle:         { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:28,y:20},  rightWrist:{x:32,y:40},   headTilt:0  },
  hello:        { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:35,y:-10}, rightWrist:{x:50,y:-30},  headTilt:5  },
  learn:        { leftElbow:{x:-35,y:5},  leftWrist:{x:-45,y:-10},rightElbow:{x:35,y:5},   rightWrist:{x:45,y:-10},  headTilt:0  },
  understand:   { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:30,y:-5},  rightWrist:{x:20,y:-25},  headTilt:-3 },
  yes:          { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:32,y:5},   rightWrist:{x:38,y:-5},   headTilt:8  },
  no:           { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:40,y:10},  rightWrist:{x:55,y:15},   headTilt:-8 },
  good:         { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:30,y:0},   rightWrist:{x:42,y:-15},  headTilt:3  },
  watch:        { leftElbow:{x:-30,y:0},  leftWrist:{x:-22,y:-18},rightElbow:{x:30,y:0},   rightWrist:{x:22,y:-18},  headTilt:0  },
  think:        { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:25,y:-8},  rightWrist:{x:18,y:-22},  headTilt:-5 },
  work:         { leftElbow:{x:-32,y:15}, leftWrist:{x:-38,y:28}, rightElbow:{x:32,y:15},  rightWrist:{x:38,y:28},   headTilt:5  },
  question:     { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:32,y:-5},  rightWrist:{x:40,y:-25},  headTilt:10 },
  two_hands_up: { leftElbow:{x:-35,y:-5}, leftWrist:{x:-48,y:-28},rightElbow:{x:35,y:-5},  rightWrist:{x:48,y:-28},  headTilt:5  },
  point_right:  { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:45,y:5},   rightWrist:{x:62,y:5},    headTilt:3  },
  point_up:     { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:28,y:-15}, rightWrist:{x:28,y:-38},  headTilt:-8 },
  cross:        { leftElbow:{x:-10,y:5},  leftWrist:{x:8,y:10},   rightElbow:{x:10,y:5},   rightWrist:{x:-8,y:10},   headTilt:0  },
  spread:       { leftElbow:{x:-40,y:10}, leftWrist:{x:-58,y:12}, rightElbow:{x:40,y:10},  rightWrist:{x:58,y:12},   headTilt:0  },
  left_up:      { leftElbow:{x:-32,y:-12},leftWrist:{x:-44,y:-32},rightElbow:{x:28,y:20},  rightWrist:{x:32,y:40},   headTilt:-5 },
  both_forward: { leftElbow:{x:-20,y:8},  leftWrist:{x:-20,y:-12},rightElbow:{x:20,y:8},   rightWrist:{x:20,y:-12},  headTilt:0  },
  wave:         { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:38,y:-8},  rightWrist:{x:52,y:-20},  headTilt:8  },
  chin:         { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:22,y:0},   rightWrist:{x:14,y:10},   headTilt:5  },
  peace:        { leftElbow:{x:-28,y:20}, leftWrist:{x:-32,y:40}, rightElbow:{x:38,y:-5},  rightWrist:{x:50,y:-28},  headTilt:5  },
};

const AUTO_SIGN_SEQUENCE = [
  "hello","watch","learn","think","understand","good","work","question",
  "yes","two_hands_up","no","point_right","point_up","peace","spread",
  "left_up","both_forward","wave","chin","learn","watch","think",
  "understand","good","work","hello","yes","question","two_hands_up",
  "no","point_right","spread","wave","chin","both_forward","cross",
  "point_up","left_up","learn","peace",
];

function getAutoGloss(t: number): string {
  if (t <= 0) return "hello";
  return AUTO_SIGN_SEQUENCE[Math.floor(t) % AUTO_SIGN_SEQUENCE.length];
}

function glossToPoseName(gloss: string): string {
  const g = gloss.toLowerCase();
  if (["hello","hi","welcome","greet"].some(w=>g.includes(w))) return "hello";
  if (["learn","study","education","course","lesson"].some(w=>g.includes(w))) return "learn";
  if (["understand","know","comprehend"].some(w=>g.includes(w))) return "understand";
  if (["yes","correct","right"].some(w=>g.includes(w))) return "yes";
  if (["no","not","wrong"].some(w=>g.includes(w))) return "no";
  if (["good","great","nice","well"].some(w=>g.includes(w))) return "good";
  if (["watch","see","look","view"].some(w=>g.includes(w))) return "watch";
  if (["think","mind","idea","brain"].some(w=>g.includes(w))) return "think";
  if (["work","code","program","computer"].some(w=>g.includes(w))) return "work";
  if (["question","ask","why","how"].some(w=>g.includes(w))) return "question";
  if (["today","now","start","begin","ready"].some(w=>g.includes(w))) return "two_hands_up";
  if (["point","that","there","show"].some(w=>g.includes(w))) return "point_right";
  if (["up","above","top","high"].some(w=>g.includes(w))) return "point_up";
  if (["spread","open","wide","all"].some(w=>g.includes(w))) return "spread";
  if (["wave","bye","goodbye"].some(w=>g.includes(w))) return "wave";
  if (["peace","love"].some(w=>g.includes(w))) return "peace";
  return "idle";
}

const SVGAvatar: React.FC<{ pose: ArmPose; isActive: boolean }> = ({ pose, isActive }) => {
  const cx = 60, headY = 22, neckY = 38, shoulderY = 50, hipY = 95, kneeY = 130, footY = 160;
  const lSX = cx - 22, rSX = cx + 22;
  const sp = 0.6;
  const lEX = lSX + pose.leftElbow.x  * sp, lEY = shoulderY + pose.leftElbow.y  * sp;
  const lWX = lSX + pose.leftWrist.x  * sp, lWY = shoulderY + pose.leftWrist.y  * sp;
  const rEX = rSX + pose.rightElbow.x * sp, rEY = shoulderY + pose.rightElbow.y * sp;
  const rWX = rSX + pose.rightWrist.x * sp, rWY = shoulderY + pose.rightWrist.y * sp;
  const ht  = pose.headTilt ?? 0;
  const tr  = { type:"spring" as const, stiffness:400, damping:28 };

  return (
    <svg viewBox="0 0 120 180" width="100%" height="100%" style={{overflow:"visible"}}>
      <defs>
        <radialGradient id="sg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fcd5b0"/><stop offset="100%" stopColor="#e8a87c"/>
        </radialGradient>
        <radialGradient id="hg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4a3728"/><stop offset="100%" stopColor="#2d1f14"/>
        </radialGradient>
        <linearGradient id="shg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b5bdb"/><stop offset="100%" stopColor="#1e3a8a"/>
        </linearGradient>
      </defs>

      {/* Legs */}
      <line x1={cx-10} y1={hipY}  x2={cx-14} y2={kneeY} stroke="#374151" strokeWidth="10" strokeLinecap="round"/>
      <line x1={cx-14} y1={kneeY} x2={cx-16} y2={footY} stroke="#374151" strokeWidth="9"  strokeLinecap="round"/>
      <line x1={cx+10} y1={hipY}  x2={cx+14} y2={kneeY} stroke="#374151" strokeWidth="10" strokeLinecap="round"/>
      <line x1={cx+14} y1={kneeY} x2={cx+16} y2={footY} stroke="#374151" strokeWidth="9"  strokeLinecap="round"/>
      <ellipse cx={cx-17} cy={footY+3} rx="8" ry="4" fill="#1f2937"/>
      <ellipse cx={cx+17} cy={footY+3} rx="8" ry="4" fill="#1f2937"/>

      {/* Torso */}
      <path d={`M${lSX} ${shoulderY} L${cx-14} ${hipY} L${cx+14} ${hipY} L${rSX} ${shoulderY}Z`} fill="url(#shg)"/>
      <path d={`M${cx-8} ${neckY+2} L${cx} ${shoulderY-2} L${cx+8} ${neckY+2}`} fill="none" stroke="#93c5fd" strokeWidth="1.5"/>

      {/* Left arm */}
      <motion.line x1={lSX} y1={shoulderY} x2={lEX} y2={lEY} stroke="url(#shg)" strokeWidth="9" strokeLinecap="round" animate={{x2:lEX,y2:lEY}} transition={tr}/>
      <motion.line x1={lEX} y1={lEY} x2={lWX} y2={lWY} stroke="#e8a87c" strokeWidth="7" strokeLinecap="round" animate={{x1:lEX,y1:lEY,x2:lWX,y2:lWY}} transition={tr}/>
      <motion.circle cx={lWX} cy={lWY} r="5" fill="#fcd5b0" stroke="#e8a87c" strokeWidth="1" animate={{cx:lWX,cy:lWY}} transition={tr}/>

      {/* Right arm */}
      <motion.line x1={rSX} y1={shoulderY} x2={rEX} y2={rEY} stroke="url(#shg)" strokeWidth="9" strokeLinecap="round" animate={{x2:rEX,y2:rEY}} transition={tr}/>
      <motion.line x1={rEX} y1={rEY} x2={rWX} y2={rWY} stroke="#e8a87c" strokeWidth="7" strokeLinecap="round" animate={{x1:rEX,y1:rEY,x2:rWX,y2:rWY}} transition={tr}/>
      <motion.circle cx={rWX} cy={rWY} r="5" fill="#fcd5b0" stroke="#e8a87c" strokeWidth="1" animate={{cx:rWX,cy:rWY}} transition={tr}/>

      {/* Neck */}
      <rect x={cx-6} y={neckY} width="12" height={shoulderY-neckY+2} rx="4" fill="#e8a87c"/>

      {/* Head */}
      <motion.g animate={{rotate:ht}} style={{originX:`${cx}px`,originY:`${headY+14}px`}} transition={{type:"spring",stiffness:350,damping:25}}>
        <ellipse cx={cx}    cy={headY}    rx="17" ry="19" fill="url(#hg)"/>
        <ellipse cx={cx}    cy={headY+2}  rx="15" ry="17" fill="url(#sg)"/>
        <ellipse cx={cx}    cy={headY-10} rx="16" ry="10" fill="url(#hg)"/>
        <ellipse cx={cx-14} cy={headY+2}  rx="5"  ry="12" fill="url(#hg)"/>
        <ellipse cx={cx+14} cy={headY+2}  rx="5"  ry="12" fill="url(#hg)"/>
        <ellipse cx={cx-5}  cy={headY+2}  rx="3"  ry="3.5" fill="white"/>
        <ellipse cx={cx+5}  cy={headY+2}  rx="3"  ry="3.5" fill="white"/>
        <circle  cx={cx-5}  cy={headY+2}  r="1.8" fill="#2d1f14"/>
        <circle  cx={cx+5}  cy={headY+2}  r="1.8" fill="#2d1f14"/>
        <path d={`M${cx-8} ${headY-3} Q${cx-5} ${headY-5} ${cx-2} ${headY-3}`} fill="none" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round"/>
        <path d={`M${cx+2} ${headY-3} Q${cx+5} ${headY-5} ${cx+8} ${headY-3}`} fill="none" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round"/>
        <path d={`M${cx} ${headY+4} Q${cx+2} ${headY+8} ${cx} ${headY+9}`} fill="none" stroke="#c8845a" strokeWidth="1" strokeLinecap="round"/>
        <path d={isActive ? `M${cx-5} ${headY+12} Q${cx} ${headY+16} ${cx+5} ${headY+12}` : `M${cx-4} ${headY+12} Q${cx} ${headY+14} ${cx+4} ${headY+12}`} fill="none" stroke="#c8845a" strokeWidth="1.5" strokeLinecap="round"/>
        <ellipse cx={cx-15} cy={headY+4} rx="3" ry="5" fill="#e8a87c"/>
        <ellipse cx={cx+15} cy={headY+4} rx="3" ry="5" fill="#e8a87c"/>
      </motion.g>

      {isActive && (
        <motion.circle cx={cx} cy={90} r="55" fill="none" stroke="rgba(96,165,250,0.12)" strokeWidth="3"
          animate={{r:[52,58,52],opacity:[0.2,0.5,0.2]}} transition={{duration:1.5,repeat:Infinity}}/>
      )}
    </svg>
  );
};

interface SignAvatarProps {
  currentGloss?: string;
  isVisible: boolean;
  isLoading?: boolean;
  isActive?: boolean;
  videoTime?: number;
}

export const SignAvatar: React.FC<SignAvatarProps> = ({
  currentGloss, isVisible, isLoading=false, isActive=false, videoTime=0,
}) => {
  const [displayGloss, setDisplayGloss] = useState("hello");
  const [prevGloss, setPrevGloss] = useState("");

  useEffect(() => {
    const gloss = currentGloss || getAutoGloss(videoTime);
    if (gloss === prevGloss) return;
    setPrevGloss(gloss);
    setDisplayGloss(gloss);
  }, [currentGloss, videoTime, prevGloss]);

  const poseName = useMemo(() => glossToPoseName(displayGloss), [displayGloss]);
  const pose = SIGN_POSES[poseName] ?? SIGN_POSES.idle;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{opacity:0,x:-60,scale:0.85}}
          animate={{opacity:1,x:0,scale:1}}
          exit={{opacity:0,x:-60,scale:0.85}}
          transition={{type:"spring",damping:22,stiffness:180}}
          className="absolute bottom-0 left-4 z-[9999] pointer-events-none select-none"
          style={{width:110,height:185}}
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}
                className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"/>
            </div>
          ) : (
            <SVGAvatar pose={pose} isActive={isActive||!!displayGloss}/>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
