import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReelVideo({ videoSrc, bgMusicRef, isLast }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Unmute attempt or muted autoplay
            video.muted = false;
            const playPromise = video.play();

            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setIsMuted(false);
                  setNeedsTap(false);
                  pauseBgMusic();
                })
                .catch(() => {
                  // Fallback to muted playback if sound autoplay is blocked
                  video.muted = true;
                  setIsMuted(true);
                  video
                    .play()
                    .then(() => {
                      setIsPlaying(true);
                      setNeedsTap(false);
                      pauseBgMusic();
                    })
                    .catch(() => {
                      setIsPlaying(false);
                      setNeedsTap(true);
                      resumeBgMusic();
                    });
                });
            }
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.4, rootMargin: '60px 0px 60px 0px' }
    );

    observer.observe(video);
    return () => observer.unobserve(video);
  }, [bgMusicRef, pauseBgMusic, resumeBgMusic]);

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setNeedsTap(false);
          pauseBgMusic();
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => {
            setIsPlaying(true);
            setNeedsTap(false);
            pauseBgMusic();
          });
        });
    } else {
      video.pause();
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
    }
  };

  return (
    <div className="reel-frame" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        playsInline
        preload="auto"
        className="reel-video"
        onEnded={() => {
          setIsPlaying(false);
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
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
        <motion.div
          className="keep-scrolling"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span>Keep scrolling</span>
          <motion.span
            className="scroll-arrow"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
