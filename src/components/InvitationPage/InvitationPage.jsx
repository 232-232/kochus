import { useEffect, useRef } from 'react';
import LoveStoryStack from './LoveStoryStack';
import ReelVideo from './ReelVideo';
import { REELS } from './storyData';
import './invitation.css';

export default function InvitationPage({ onReelPlaybackChange }) {
  const activeVideoRef = useRef(null);

  useEffect(() => () => onReelPlaybackChange?.(false), [onReelPlaybackChange]);

  const handleScrollToStory = () => {
    document.querySelector('.story-track')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="invite-root">
      <header className="invite-hero">
        <p className="hero-kicker">A garden of our years</p>
        <h1>Kochuusey</h1>
        <p className="hero-line">Happy birthday</p>
        <p className="hero-note">
          Scroll through the years, and watch each memory bloom into the next.
        </p>
        <button
          type="button"
          className="hero-scroll-btn"
          onClick={handleScrollToStory}
          aria-label="Begin the story"
        >
          <span>Begin the story</span>
          <i className="mouse-wheel" />
        </button>
      </header>

      <LoveStoryStack />

      <section className="reel-section">
        <p className="reel-label">A gift for you · Our moments</p>
        {REELS.map((videoSrc, index) => (
          <ReelVideo
            key={videoSrc}
            videoSrc={videoSrc}
            activeVideoRef={activeVideoRef}
            onPlaybackChange={onReelPlaybackChange}
            isLast={index === REELS.length - 1}
          />
        ))}
      </section>

      <footer className="invite-letter">
        <p className="letter-kicker">A wish from my heart</p>
        <div className="letter-card">
          <p>
            Once again, wishing you the happiest of birthdays. May this year bring you endless joy,
            beautiful moments, and everything your heart desires. I hope all the good things you
            deserve find their way to you — because you truly light up every life you touch.
          </p>
          <p>
            Thank you for being you. Here is to more laughter, more memories, and a year filled with love.
          </p>
          <p className="letter-sign">With all my love,</p>
          <p className="letter-name">mubiyeyyy</p>
        </div>
      </footer>
    </div>
  );
}
