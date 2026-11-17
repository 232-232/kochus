import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function ReelVideo({ videoSrc, activeVideoRef, onPlaybackChange, isLast }) {
  const videoRef = useRef(null);
  const isVisibleRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const reduceMotion = useReducedMotion();

  const notifyPlayback = (playing) => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      if (activeVideoRef.current === video) onPlaybackChange?.(true);
    } else if (activeVideoRef.current === video || activeVideoRef.current === null) {
      onPlaybackChange?.(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVisibleVideo = async () => {
      if (!isVisibleRef.current) return;

      const activeVideo = activeVideoRef.current;
      if (activeVideo && activeVideo !== video) activeVideo.pause();
      activeVideoRef.current = video;

      video.muted = false;
      try {
        await video.play();
        if (!isVisibleRef.current || activeVideoRef.current !== video) return;
        setIsPlaying(true);
        setNeedsTap(false);
      } catch {
        if (!isVisibleRef.current || activeVideoRef.current !== video) return;
        activeVideoRef.current = null;
        onPlaybackChange?.(false);
        setIsPlaying(false);
        setNeedsTap(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          if (isVisibleRef.current) {
            playVisibleVideo();
          } else {
            video.pause();
            if (activeVideoRef.current === video) {
              activeVideoRef.current = null;
              onPlaybackChange?.(false);
            }
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px' }
    );

    observer.observe(video);
    return () => {
      isVisibleRef.current = false;
      observer.disconnect();
      video.pause();
      if (activeVideoRef.current === video) {
        activeVideoRef.current = null;
        onPlaybackChange?.(false);
      }
    };
  }, [activeVideoRef, onPlaybackChange]);

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const activeVideo = activeVideoRef.current;
      if (activeVideo && activeVideo !== video) activeVideo.pause();
      activeVideoRef.current = video;
      video.muted = false;
      video
        .play()
        .then(() => {
          if (activeVideoRef.current !== video) return;
          setIsPlaying(true);
          setNeedsTap(false);
        })
        .catch(() => {
          if (activeVideoRef.current !== video) return;
          activeVideoRef.current = null;
          onPlaybackChange?.(false);
          setIsPlaying(false);
          setNeedsTap(true);
        });
    } else {
      video.pause();
      if (activeVideoRef.current === video) {
        activeVideoRef.current = null;
        onPlaybackChange?.(false);
      }
      setIsPlaying(false);
    }
  };

  return (
    <div className="reel-frame" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        playsInline
        preload="none"
        className="reel-video"
        onPause={() => {
          setIsPlaying(false);
          notifyPlayback(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
          notifyPlayback(true);
        }}
      />

      {/* Play/Pause Center Indicator */}
      <AnimatePresence>
        {(!isPlaying || needsTap) && (
          <motion.div
            className="reel-badge"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          >
            <span className="play-orb">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keep scrolling hint */}
      {isPlaying && !isLast && (
        <div className="keep-scrolling">
          <span>Keep scrolling</span>
          <span className="scroll-arrow" aria-hidden="true">↓</span>
        </div>
      )}
    </div>
  );
}
