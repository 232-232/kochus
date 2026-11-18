import { useEffect, useState } from 'react';
import LoveStoryStack from './LoveStoryStack';
import birthdayCollage from '../../assets/birthday-collage.jpeg';
import birthdayPortrait from '../../assets/birthday-portrait.png';
import birthdayPink from '../../assets/birthday-pink.png';
import birthdayMemories from '../../assets/birthday-memories.png';
import './invitation.css';

const BIRTHDAY_PHOTOS = [
  { src: birthdayCollage, alt: 'Birthday collage celebrating our favorite memories', caption: 'My favourite person' },
  { src: birthdayPortrait, alt: 'Birthday portrait with a wish for happiness and success', caption: 'All the happiness in the world' },
  { src: birthdayPink, alt: 'Pink birthday portrait with flowers and butterflies', caption: 'A little birthday magic' },
  { src: birthdayMemories, alt: 'Scrapbook collage of us and our memories', caption: 'Always better together' },
];

export default function InvitationPage({ onNavigateToGift, onProgress, restoreScrollY }) {
  const [journeyComplete, setJourneyComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, restoreScrollY);
  }, [restoreScrollY]);

  useEffect(() => {
    const updateJourneyProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll <= 0 ? 100 : Math.min(1, window.scrollY / maxScroll);
      const atEnd = maxScroll <= 0 || window.scrollY >= maxScroll - 24;
      onProgress?.(Math.round(72 + progress * 28));
      setJourneyComplete(atEnd);
    };

    updateJourneyProgress();
    window.addEventListener('scroll', updateJourneyProgress, { passive: true });
    window.addEventListener('resize', updateJourneyProgress);
    return () => {
      window.removeEventListener('scroll', updateJourneyProgress);
      window.removeEventListener('resize', updateJourneyProgress);
    };
  }, [onProgress]);

  const handleScrollToStory = () => {
    document.querySelector('.birthday-gallery')?.scrollIntoView({
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
          aria-label="See your birthday photos"
        >
          <span>See your birthday photos</span>
          <i className="mouse-wheel" />
        </button>
      </header>

      <section className="birthday-gallery" aria-label="Birthday photo memories">
        <div className="birthday-gallery-heading">
          <p>Made just for you</p>
          <h2>Birthday memories</h2>
        </div>
        <div className="birthday-gallery-grid">
          {BIRTHDAY_PHOTOS.map((photo) => (
            <figure className="birthday-photo" key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <LoveStoryStack />

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
          <button type="button" className="letter-gift-btn" onClick={onNavigateToGift}>
            One More Gift
          </button>
        </div>
      </footer>
      {journeyComplete && (
        <div className="journey-complete" role="status">
          <p>You made it through our whole journey. I hope it made you smile.</p>
        </div>
      )}
    </div>
  );
}
