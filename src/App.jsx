import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BirthdayLockScreen from './components/BirthdayLockScreen/BirthdayLockScreen';
import ArrowHeartScene from './components/SurprisePage/ArrowHeartScene';
import SurprisePage from './components/SurprisePage/SurprisePage';
import HeavenGarden from './components/InvitationPage/HeavenGarden';
import InvitationPage from './components/InvitationPage/InvitationPage';
import GiftPage from './components/InvitationPage/GiftPage';
import backgroundMusic from './assets/bg.m4a';
import './App.css';

export default function App() {
  const [page, setPage] = useState('lock');
  const [heartCurtainVisible, setHeartCurtainVisible] = useState(false);
  const [heartSceneMounted, setHeartSceneMounted] = useState(true);
  const [invitationScrollY, setInvitationScrollY] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState(0);
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
    setJourneyProgress(10);
    setPage('heart');
  };

  const handleHeartComplete = useCallback(() => {
    setJourneyProgress(20);
    setPage('surprise');
  }, []);
  const handleNavigateToInvitation = useCallback(() => {
    setJourneyProgress((progress) => Math.max(progress, 72));
    setPage('invitation');
  }, []);
  const handleNavigateToGift = useCallback(() => {
    setInvitationScrollY(window.scrollY);
    setJourneyProgress(100);
    setPage('gift');
  }, []);
  const handleReturnToInvitation = useCallback(() => setPage('invitation'), []);
  const handleJourneyProgress = useCallback((progress) => {
    setJourneyProgress((current) => Math.max(current, progress));
  }, []);

  const handleGardenReady = useCallback(() => {
    setHeartCurtainVisible(false);
    window.clearTimeout(heartSceneRetireTimerRef.current);
    heartSceneRetireTimerRef.current = window.setTimeout(() => {
      setHeartSceneMounted(false);
    }, 600);
  }, []);

  useEffect(() => () => window.clearTimeout(heartSceneRetireTimerRef.current), []);

  return (
    <div className="app-container">
      {page === 'invitation' && <HeavenGarden />}
      {page !== 'lock' && (
        <div
          className="journey-progress"
          role="progressbar"
          aria-label="Birthday journey progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={journeyProgress}
        >
          <span
            className="journey-progress-fill"
            aria-hidden="true"
            style={{ width: `${journeyProgress}%` }}
          />
          <span className="journey-progress-label" aria-hidden="true">
            {journeyProgress}%
          </span>
        </div>
      )}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
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
              onProgress={handleJourneyProgress}
            />
          )}

          {page === 'invitation' && (
            <InvitationPage
              onNavigateToGift={handleNavigateToGift}
              onProgress={handleJourneyProgress}
              restoreScrollY={invitationScrollY}
            />
          )}

          {page === 'gift' && (
            <GiftPage
              onBack={handleReturnToInvitation}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}