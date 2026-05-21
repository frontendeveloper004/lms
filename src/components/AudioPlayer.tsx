"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Settings, FastForward, Rewind } from "lucide-react";
import { Button } from "./ui/button";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export default function AudioPlayer({ src, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRates, setShowRates] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowRates(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`p-4 sm:p-5 lg:p-6 bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-700/50 ${className}`}>
      <audio ref={audioRef} src={src} />
      
      {/* Waveform-like Progress Bar */}
      <div className="relative mb-6 group">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 overflow-hidden"
          style={{
            background: `linear-gradient(to right, #6366f1 ${(currentTime / duration) * 100}%, #1e293b ${(currentTime / duration) * 100}%)`
          }}
        />
        <div className="flex justify-between mt-2 text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-3">
          <Button
            onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10; }}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full w-8 h-8 sm:w-10 sm:h-10"
          >
            <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          <Button
            onClick={togglePlay}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />}
          </Button>

          <Button
            onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10; }}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full w-8 h-8 sm:w-10 sm:h-10"
          >
            <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <Button
              onClick={() => setShowRates(!showRates)}
              variant="ghost"
              className="text-indigo-400 font-black text-xs uppercase tracking-widest bg-indigo-500/10 px-3 sm:px-4 h-9 sm:h-10 rounded-xl hover:bg-indigo-500/20"
            >
              {playbackRate}x
            </Button>
            
            {showRates && (
              <div className="absolute bottom-full mb-3 right-0 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-2xl flex flex-col min-w-[80px] animate-in fade-in slide-in-from-bottom-2 z-10">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => changeRate(r)}
                    className={`px-4 py-2 text-xs font-black rounded-lg text-left transition-colors ${
                      playbackRate === r ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
