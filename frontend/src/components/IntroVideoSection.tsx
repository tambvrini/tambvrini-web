import { useEffect, useRef } from 'react';

const INTRO_VIDEO_SRC = '/videos/tambvrini-intro-loop.mp4';

const IntroVideoSection = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.4, 1] }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="intro-video-section"
      className="relative w-full h-screen overflow-hidden bg-white"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={INTRO_VIDEO_SRC}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
    </section>
  );
};

export default IntroVideoSection;
