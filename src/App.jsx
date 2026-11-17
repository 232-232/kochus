import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BirthdayLockScreen from './components/BirthdayLockScreen/BirthdayLockScreen';
import ArrowHeartScene from './components/SurprisePage/ArrowHeartScene';
import SurprisePage from './components/SurprisePage/SurprisePage';
import HeavenGarden from './components/InvitationPage/HeavenGarden';
import InvitationPage from './components/InvitationPage/InvitationPage';
import backgroundMusic from './assets/bg.m4a';
import './App.css';

export default function App() {
  const [page, setPage] = useState('lock'); // 'lock' | 'heart' | 'surprise' | 'invitation'
  const [heartCurtainVisible, setHeartCurtainVisible] = useState(false);
  const [heartSceneMounted, setHeartSceneMounted] = useState(true);
  const audioRef = useRef(null);
  const heartSceneRetireTimerRef = useRef(null);

  const handleUnlock = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.4;
      audio.muted = false;
      audio.loop = true;
      audio.play().catch((error) => {
        console.error('Unable to play bg.m4a after unlock.', error);
      });
    }
    setHeartCurtainVisible(true);
    setPage('heart');
  };

  const handleHeartComplete = useCallback(() => setPage('surprise'), []);
  const handleNavigateToInvitation = useCallback(() => setPage('invitation'), []);

  const handleGardenReady = useCallback(() => {
    setHeartCurtainVisible(false);
    window.clearTimeout(heartSceneRetireTimerRef.current);
    heartSceneRetireTimerRef.current = window.setTimeout(() => {
      setHeartSceneMounted(false);
    }, 600);
  }, []);

  const handleReelPlaybackChange = useCallback((isPlaying) => {
    if (audioRef.current) audioRef.current.muted = isPlaying;
  }, []);

  useEffect(() => () => window.clearTimeout(heartSceneRetireTimerRef.current), []);

  return (
    <div className="app-container">
      {page !== 'surprise' && page !== 'heart' && <HeavenGarden />}
      {/* Global background music element */}
      <audio ref={audioRef} src={backgroundMusic} preload="none" />

      {heartSceneMounted && (
        <ArrowHeartScene
          active={page === 'heart'}
          visible={page === 'heart' || heartCurtainVisible}
          onComplete={handleHeartComplete}
        />
      )}

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
            <div aria-hidden="true" />
          )}

          {page === 'surprise' && (
            <SurprisePage
              onReady={handleGardenReady}
              onNavigateToInvitation={handleNavigateToInvitation}
            />
          )}

          {page === 'invitation' && (
            <InvitationPage onReelPlaybackChange={handleReelPlaybackChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}