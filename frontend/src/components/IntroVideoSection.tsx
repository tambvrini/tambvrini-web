import { useEffect, useRef, useState } from 'react';

const IntroVideoSection = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted) {
      return undefined;
    }

    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            const video = videoRef.current;

            if (video) {
              video.loop = true;
              video.play().catch(() => undefined);
            }

            setHasStarted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: [0, 0.2, 1] }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [hasStarted]);

  const handlePause = () => {
    if (hasStarted && videoRef.current) {
      videoRef.current.play().catch(() => undefined);
    }
  };

  return (
    <section ref={sectionRef} className="w-full h-screen">
      <div
        className="w-full h-full overflow-hidden"
        style={{
          opacity: hasStarted ? 1 : 0,
          transform: hasStarted ? 'scale(1)' : 'scale(1.02)',
          transition: 'opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src="/videos/tambvrini-intro-loop.mp4"
          muted
          playsInline
          preload="auto"
          aria-label="Tambvrini intro video"
          onPause={handlePause}
        />
      </div>
    </section>
  );
};

export default IntroVideoSection;
