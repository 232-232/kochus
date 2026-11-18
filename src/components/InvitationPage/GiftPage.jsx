import birthdayCollage from '../../assets/birthday-collage.jpeg';
import birthdayPortrait from '../../assets/birthday-portrait.png';
import birthdayPink from '../../assets/birthday-pink.png';
import birthdayMemories from '../../assets/birthday-memories.png';
import './invitation.css';

const GIFT_PHOTOS = [
  { src: birthdayCollage, alt: 'Birthday collage celebrating our favorite memories' },
  { src: birthdayPortrait, alt: 'A birthday portrait' },
  { src: birthdayPink, alt: 'A birthday portrait with flowers and butterflies' },
  { src: birthdayMemories, alt: 'A scrapbook of shared memories' },
];

export default function GiftPage({ onBack }) {
  return (
    <main className="gift-page">
      <button type="button" className="gift-back-btn" onClick={onBack}>
        Back to birthday letter
      </button>
      <section className="gift-content">
        <p className="letter-kicker">One more little gift</p>
        <h1>For all the memories still waiting for us</h1>
        <p className="gift-message">
          Thank you for every year, every laugh, and every little moment. Here is to all the
          beautiful memories we have yet to make together.
        </p>
        <div className="gift-photo-grid">
          {GIFT_PHOTOS.map((photo) => (
            <img key={photo.src} src={photo.src} alt={photo.alt} />
          ))}
        </div>
        <p className="gift-signature">With all my love, mubiyeyyy</p>
      </section>
      <div className="gift-complete" role="status">
        <p>Journey complete</p>
        <span>And our story keeps blooming.</span>
      </div>
    </main>
  );
}
