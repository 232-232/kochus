import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { STORIES } from './storyData';

function StoryCard({ story, index, direction }) {
  const reversed = index % 2 === 1;

  return (
    <motion.article
      custom={direction}
      className="story-card"
      initial={{ opacity: 0, y: direction > 0 ? 24 : -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: direction > 0 ? -24 : 24 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
            loading="lazy"
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
  );
}

export default function LoveStoryStack() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = STORIES.length;
  const story = STORIES[active];

  const navigateToChapter = (index) => {
    if (index < 0 || index >= total || index === active) return;
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  return (
    <section className="story-track">
      <div className="story-stage">
        <p className="story-scroll-hint">
          Chapter {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>

        <button
          type="button"
          className="story-arrow story-arrow-previous"
          onClick={() => navigateToChapter(active - 1)}
          disabled={active === 0}
          aria-label="Previous chapter"
        >
          <ArrowUp size={22} aria-hidden="true" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <StoryCard
            key={`${story.year}-${story.title}`}
            story={story}
            index={active}
            direction={direction}
          />
        </AnimatePresence>

        <button
          type="button"
          className="story-arrow story-arrow-next"
          onClick={() => navigateToChapter(active + 1)}
          disabled={active === total - 1}
          aria-label="Next chapter"
        >
          <ArrowDown size={22} aria-hidden="true" />
        </button>

        <ol className="year-rail" aria-label="Timeline navigation">
          {STORIES.map((story, index) => (
            <li
              key={`${story.year}-${story.title}`}
              className={index === active ? 'is-active' : ''}
              onClick={() => navigateToChapter(index)}
              role="button"
              tabIndex={0}
              title={`Show ${story.year}`}
              onKeyDown={(e) => e.key === 'Enter' && navigateToChapter(index)}
            >
              <span className="rail-bullet" />
              <span className="rail-year">{story.year}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
