import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BirthdayLockScreen from './components/BirthdayLockScreen/BirthdayLockScreen';
import ArrowHeartScene from './components/SurprisePage/ArrowHeartScene';
import SurprisePage from './components/SurprisePage/SurprisePage';
import HeavenGarden from './components/InvitationPage/HeavenGarden';
import InvitationPage from './components/InvitationPage/InvitationPage';
import backgroundMusic from './assets/bg.mp3';
import './App.css';

export default function App() {
  const [page, setPage] = useState('lock'); // 'lock' | 'heart' | 'surprise' | 'invitation'
  const audioRef = useRef(null);

  const handleUnlock = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.4;
      audio.loop = true;
      audio.play().catch((error) => {
        console.error('Unable to play bg.mp3 after unlock.', error);
      });
    }
    setPage('heart');
  };

  return (
    <div className="app-container">
      {page !== 'surprise' && page !== 'heart' && <HeavenGarden />}
      {/* Global background music element */}
      <audio ref={audioRef} src={backgroundMusic} preload="auto" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page}
          className="app-page-transition"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {page === 'lock' && (
            <BirthdayLockScreen
              passcode="0112"
              onUnlock={handleUnlock}
            />
          )}

          {page === 'heart' && (
            <ArrowHeartScene onComplete={() => setPage('surprise')} />
          )}

          {page === 'surprise' && (
            <SurprisePage onNavigateToInvitation={() => setPage('invitation')} />
          )}

          {page === 'invitation' && (
            <InvitationPage />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}