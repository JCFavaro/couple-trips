import { useMemo } from 'react';
import { generateStars } from '../../lib/utils';

export function MagicBackground() {
  const stars = useMemo(() => generateStars(50), []);

  return (
    <div className="stars-container">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            '--duration': `${star.duration}s`,
            '--max-opacity': star.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
