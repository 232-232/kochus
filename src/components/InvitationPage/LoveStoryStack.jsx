import { memo, useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { STORIES } from './storyData';

const STICKY_TOP = 96;

function StoryCardContent({ story, index }) {
  return (
    <div className="story-layout">
      <div className="story-copy">
        <p className="story-kicker">
          <span>{story.season}</span>
          <span className="story-dot" />
          <span>Chapter {String(index + 1).padStart(2, '0')}</span>
        </p>
        <h2 className="story-year">{story.year}</h2>
        <h3 className="story-title">{story.title}</h3>
        <p className="story-text">{story.text}</p>
      </div>

      <figure className="story-media">
        <div className="photo-glow" />
        <img
          src={story.image}
          alt={`${story.year} — ${story.title}`}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onError={(event) => {
            if (!story.fallback || event.currentTarget.dataset.fallback === '1') return;
            event.currentTarget.dataset.fallback = '1';
            event.currentTarget.src = story.fallback;
          }}
        />
        <figcaption>{story.season} · {story.year}</figcaption>
      </figure>
    </div>
  );
}

const AnimatedStoryCard = memo(function AnimatedStoryCard({ story, index, total }) {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });

  const { scrollYProgress: coverProgress } = useScroll({
    target: sectionRef,
    offset: ['end start', 'end end'],
  });

  // Entry animation
  const entryY = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const entryScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  // Cover animation (No opacity change, purely physical scale/rotate)
  const coverScale = useTransform(coverProgress, [0, 1], [1, 0.92]);
  const coverY = useTransform(coverProgress, [0, 1], [0, -40]);
  const coverRotate = useTransform(coverProgress, [0, 1], [0, -2]);

  const combinedY = useTransform([entryY, coverY], ([a, b]) => a + b);
  const combinedScale = useTransform(
    [entryScale, coverScale],
    ([a, b]) => a * b
  );

  const isLast = index === total - 1;

  const style = reduceMotion
    ? undefined
    : {
        y: combinedY,
        scale: combinedScale,
        rotate: isLast ? 0 : coverRotate,
        zIndex: index + 1,
      };

  return (
    <section
      ref={sectionRef}
      className="story-scene"
      aria-label={`Chapter ${index + 1}: ${story.year}`}
      style={{
        position: 'sticky',
        top: STICKY_TOP,
        zIndex: index + 1,
      }}
    >
      <motion.article className="story-card" style={style}>
        <StoryCardContent story={story} index={index} />
      </motion.article>
    </section>
  );
});

const StaticStoryCard = memo(function StaticStoryCard({ story, index }) {
  return (
    <section className="story-scene" aria-label={`Chapter ${index + 1}: ${story.year}`}>
      <article className="story-card">
        <StoryCardContent story={story} index={index} />
      </article>
    </section>
  );
});

export default function LoveStoryStack() {
  const [isTouchDevice, setIsTouchDevice] = useState(() => (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  ));
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    const updateTouchLayout = (event) => setIsTouchDevice(event.matches);
    touchQuery.addEventListener('change', updateTouchLayout);
    return () => touchQuery.removeEventListener('change', updateTouchLayout);
  }, []);

  const Card = isTouchDevice || reduceMotion ? StaticStoryCard : AnimatedStoryCard;

  return (
    <section
      className="story-track"
      aria-label="Our story through the years"
    >
      {STORIES.map((story, index) => (
        <Card
          key={`${story.year}-${story.title}`}
          story={story}
          index={index}
          total={STORIES.length}
        />
      ))}
    </section>
  );
}