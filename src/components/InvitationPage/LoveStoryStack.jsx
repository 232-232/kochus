import { memo, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { STORIES } from './storyData';

const StoryCard = memo(function StoryCard({ story, index }) {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [28, 0, -18]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.985, 1, 0.985]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0, -0.5]);
  const reversed = index % 2 === 1;

  return (
    <section ref={sectionRef} className="story-scene" aria-label={`Chapter ${index + 1}: ${story.year}`}>
      <motion.article
        className="story-card"
        style={reduceMotion ? undefined : { opacity, y, scale, rotateX }}
      >
        <div className={`story-layout ${reversed ? 'reverse' : ''}`}>
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
      </motion.article>
    </section>
  );
});

export default function LoveStoryStack() {
  return (
    <section className="story-track" aria-label="Our story through the years">
      {STORIES.map((story, index) => (
        <StoryCard key={`${story.year}-${story.title}`} story={story} index={index} />
      ))}
    </section>
  );
}
