import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const POINTER_CENTER = 0.5;
const TILT_MULTIPLIER = 8;
const MAX_TILT_DEGREES = 4;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CategoryCard({
  title,
  image,
  link,
  index = 0,
  testId,
}) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pointerTilt, setPointerTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const activateCard = () => {
    navigate(link);
  };

  const handleMouseMove = ({ clientX, clientY }) => {
    const node = cardRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const rotateY = clamp(
      (x - POINTER_CENTER) * TILT_MULTIPLIER,
      -MAX_TILT_DEGREES,
      MAX_TILT_DEGREES
    );
    const rotateX = clamp(
      (POINTER_CENTER - y) * TILT_MULTIPLIER,
      -MAX_TILT_DEGREES,
      MAX_TILT_DEGREES
    );

    setPointerTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPointerTilt({ rotateX: 0, rotateY: 0 });
  };

  const visibilityOffset = isVisible ? (isHovered ? -5 : 0) : 40;
  const cardScale = isHovered ? 1.04 : 1;
  const cardTransform = `perspective(1400px) translateY(${visibilityOffset}px) rotateX(${pointerTilt.rotateX}deg) rotateY(${pointerTilt.rotateY}deg) scale(${cardScale})`;
  const imageTransform = `scale(${isHovered ? 1.02 : 1})`;

  return (
    <a
      ref={cardRef}
      data-testid={testId}
      href={link}
      aria-label={title}
      onClick={(event) => {
        event.preventDefault();
        activateCard();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="category-card group relative block min-w-[82vw] sm:min-w-[68vw] md:min-w-0 cursor-pointer snap-start overflow-hidden rounded-[20px] border border-white/30 shadow-[0_20px_45px_rgba(15,15,15,0.08)] outline-none"
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(6px)',
        transform: cardTransform,
        transformStyle: 'preserve-3d',
        transitionDelay: `${index * 100}ms`,
        transitionDuration: isHovered ? '0.4s' : '0.8s',
        transitionProperty: 'opacity, transform, filter, box-shadow, border-color',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: isHovered
          ? '0 30px 60px rgba(15, 15, 15, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.24)'
          : '0 20px 45px rgba(15, 15, 15, 0.08)',
      }}
    >
      <div className="relative overflow-hidden rounded-[20px]">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full object-cover object-center"
          style={{
            aspectRatio: '4 / 5',
            width: '100%',
            height: 'auto',
            display: 'block',
            transform: imageTransform,
            transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end p-6 md:p-7">
          <div
            className="text-left text-white"
            style={{
              transform: 'translateZ(32px)',
              textShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            }}
          >
            <span className="block font-montserrat text-[10px] uppercase tracking-[0.38em] text-white/70">
              Editorial Selection
            </span>
            <h3
              className="mt-3 font-playfair text-[1.45rem] uppercase tracking-[0.28em] md:text-[1.6rem]"
              style={{
                transform: `translateY(${isHovered ? '-4px' : '0px'})`,
                transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {title}
            </h3>
          </div>
        </div>
      </div>
    </a>
  );
}
