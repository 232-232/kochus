import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function ReelVideo({ videoSrc, bgMusicRef, activeVideoRef, isLast }) {
  const videoRef = useRef(null);
  const isVisibleRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const reduceMotion = useReducedMotion();

  const pauseBgMusic = useCallback(() => {
    const bgMusic = bgMusicRef?.current;
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
    }
  }, [bgMusicRef]);

  const resumeBgMusic = useCallback(() => {
    const bgMusic = bgMusicRef?.current;
    if (bgMusic && bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  }, [bgMusicRef]);

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
        setIsMuted(false);
        setNeedsTap(false);
        pauseBgMusic();
      } catch {
        if (!isVisibleRef.current || activeVideoRef.current !== video) return;
        video.muted = true;
        try {
          await video.play();
          if (!isVisibleRef.current || activeVideoRef.current !== video) return;
          setIsPlaying(true);
          setIsMuted(true);
          setNeedsTap(false);
          resumeBgMusic();
        } catch {
          if (!isVisibleRef.current || activeVideoRef.current !== video) return;
          activeVideoRef.current = null;
          setIsPlaying(false);
          setNeedsTap(true);
          resumeBgMusic();
        }
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
              resumeBgMusic();
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
        resumeBgMusic();
      }
    };
  }, [activeVideoRef, pauseBgMusic, resumeBgMusic]);

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const activeVideo = activeVideoRef.current;
      if (activeVideo && activeVideo !== video) activeVideo.pause();
      activeVideoRef.current = video;
      video
        .play()
        .then(() => {
          if (activeVideoRef.current !== video) return;
          setIsPlaying(true);
          setNeedsTap(false);
          if (video.muted) resumeBgMusic();
          else pauseBgMusic();
        })
        .catch(() => {
          if (activeVideoRef.current !== video) return;
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => {
            if (activeVideoRef.current !== video) return;
            setIsPlaying(true);
            setNeedsTap(false);
            resumeBgMusic();
          }).catch(() => {
            if (activeVideoRef.current !== video) return;
            activeVideoRef.current = null;
            setIsPlaying(false);
            setNeedsTap(true);
          });
        });
    } else {
      video.pause();
      if (activeVideoRef.current === video) activeVideoRef.current = null;
      setIsPlaying(false);
      resumeBgMusic();
    }
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
      pauseBgMusic();
    } else {
      video.muted = true;
      setIsMuted(true);
      resumeBgMusic();
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
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => {
          setIsPlaying(false);
          if (activeVideoRef.current === videoRef.current) activeVideoRef.current = null;
          resumeBgMusic();
        }}
      />

      {/* Floating sound toggle button */}
      <button
        type="button"
        className={`reel-sound-btn ${isMuted ? 'is-muted' : 'is-audible'}`}
        onClick={toggleSound}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
        <span>{isMuted ? 'Tap for sound' : 'Sound on'}</span>
      </button>

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
