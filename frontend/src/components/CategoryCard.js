import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_SCROLL_OFFSET = 18;
const POINTER_CENTER = 0.5;
const TILT_MULTIPLIER = 8;
const MAX_TILT_DEGREES = 4;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CategoryCard({
  title,
  image,
  link,
  index = 0,
  scrollSpeed = 0.05,
  testId,
}) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pointerTilt, setPointerTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateOffset = () => {
      setScrollOffset(clamp((window.scrollY || 0) * scrollSpeed, 0, MAX_SCROLL_OFFSET));
    };

    updateOffset();
    window.addEventListener('scroll', updateOffset, { passive: true });

    return () => window.removeEventListener('scroll', updateOffset);
  }, [scrollSpeed]);

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
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
      className="group relative block min-w-[82vw] sm:min-w-[68vw] md:min-w-0 cursor-pointer snap-start overflow-hidden rounded-[18px] border border-black/[0.06] bg-[#f5f2ec] shadow-[0_20px_45px_rgba(15,15,15,0.08)] outline-none"
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(6px)',
        transform: `perspective(1400px) translateY(${isVisible ? (isHovered ? -5 : 0) : 40}px) rotateX(${pointerTilt.rotateX}deg) rotateY(${pointerTilt.rotateY}deg) scale(${isHovered ? 1.01 : 1})`,
        transformStyle: 'preserve-3d',
        transitionDelay: `${index * 100}ms`,
        transitionDuration: isHovered ? '0.45s' : '0.8s',
        transitionProperty: 'opacity, transform, filter, box-shadow, border-color',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: isHovered
          ? '0 28px 55px rgba(15, 15, 15, 0.12)'
          : '0 20px 45px rgba(15, 15, 15, 0.08)',
      }}
    >
      <div className="relative h-[320px] md:h-[340px] xl:h-[360px] overflow-hidden bg-[#ece7df]">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover object-center"
          style={{
            transform: `translate3d(0, ${scrollOffset}px, 0) scale(${isHovered ? 1.075 : 1.04})`,
            transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/12 to-transparent"
          style={{
            opacity: isHovered ? 0.72 : 1,
            transition: 'opacity 0.6s ease',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end p-6 md:p-7">
          <div className="text-left text-white" style={{ transform: 'translateZ(32px)' }}>
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
