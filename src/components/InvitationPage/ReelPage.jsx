import { useEffect, useRef } from 'react';
import ReelVideo from './ReelVideo';
import { REELS } from './storyData';
import './invitation.css';

export default function ReelPage({ onBack, onPlaybackChange }) {
  const activeVideoRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="reel-page">
      <button type="button" className="reel-back-btn" onClick={onBack}>
        Back to birthday letter
      </button>
      <section className="reel-section" aria-label="Birthday reels">
        <p className="reel-label">A gift for you · Our moments</p>
        {REELS.map((videoSrc, index) => (
          <ReelVideo
            key={videoSrc}
            videoSrc={videoSrc}
            activeVideoRef={activeVideoRef}
            onPlaybackChange={onPlaybackChange}
            isLast={index === REELS.length - 1}
          />
        ))}
      </section>
    </main>
  );
}
