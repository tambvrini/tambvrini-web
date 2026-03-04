import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const LIMITED_EDITIONS_PRODUCTS = [
  {
    id: 'americana-umbra',
    title: 'Americana Umbra',
    description: 'Tailored darkness in its purest form.',
    image: '/products/americana-umbra/americana-umbra-main.jpg',
    href: '/producto/americana-umbra',
  },
  {
    id: 'ignatius-sweater',
    title: 'Ignatius Sweater',
    description: 'Knitwear shaped by infernal contrast.',
    image: '/thumbnails/ignatius-sweater-thumb.jpg',
    href: '/producto/sueter-ignatius',
  },
];

export default function LimitedEditionsPage() {
  const [isActive, setIsActive] = useState(false);
  const sectionRefs = useRef([]);
  const imageWrapperRefs = useRef([]);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const cursorRefs = useRef([]);
  const cursorRafRefs = useRef([]);
  const scrollRaf = useRef(null);

  const sections = useMemo(() => LIMITED_EDITIONS_PRODUCTS, []);

  useEffect(() => {
    document.body.classList.add('limited-editions-mode');
    return () => {
      document.body.classList.remove('limited-editions-mode');
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const id = requestAnimationFrame(() => setIsActive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.25 },
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateSectionStyles = () => {
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const viewHeight = window.innerHeight || 1;
        const progress = Math.min(
          1,
          Math.max(0, (viewHeight - rect.top) / (rect.height + viewHeight)),
        );
        const scale = 1.05 - 0.05 * progress;
        const translateY = 60 * (1 - progress);
        const parallax = -40 * progress;
        const textOpacity = Math.min(1, Math.max(0, (progress - 0.2) / 0.6));

        const imageWrapper = imageWrapperRefs.current[index];
        const image = imageRefs.current[index];
        const text = textRefs.current[index];

        if (imageWrapper) {
          imageWrapper.style.setProperty('--scroll-scale', scale.toFixed(3));
          imageWrapper.style.setProperty('--scroll-translate', `${translateY.toFixed(1)}px`);
        }
        if (image) {
          image.style.setProperty('--parallax-shift', `${parallax.toFixed(1)}px`);
        }
        if (text) {
          text.style.setProperty('--text-opacity', textOpacity.toFixed(2));
          text.style.setProperty('--text-translate', `${(20 * (1 - textOpacity)).toFixed(1)}px`);
        }
      });
    };

    const handleScroll = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = requestAnimationFrame(() => {
        updateSectionStyles();
        scrollRaf.current = null;
      });
    };

    updateSectionStyles();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  const handleMouseMove = (event, index) => {
    const cursor = cursorRefs.current[index];
    if (!cursor) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (cursorRafRefs.current[index]) {
      cancelAnimationFrame(cursorRafRefs.current[index]);
    }
    cursorRafRefs.current[index] = requestAnimationFrame(() => {
      cursor.style.left = `${x.toFixed(1)}px`;
      cursor.style.top = `${y.toFixed(1)}px`;
    });
  };

  return (
    <div
      data-testid="limited-editions-page"
      className={`limited-editions-page ${isActive ? 'limited-editions-page--active' : ''}`}
    >
      <div
        className={`limited-editions-portal ${isActive ? 'limited-editions-portal--active' : ''}`}
        aria-hidden="true"
      />
      <div className="limited-editions-content">
        <section className="limited-editions-hero">
          <div className="limited-editions-hero-inner">
            <p className="limited-editions-eyebrow">Private Exhibition</p>
            <h1 className="limited-editions-title">LIMITED EDITIONS</h1>
            <p className="limited-editions-subtitle">
              Rare garments created in strictly limited quantities.
            </p>
          </div>
        </section>
        <div className="limited-editions-sections">
          {sections.map((product, index) => (
            <section
              key={product.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className="limited-editions-section"
              onMouseMove={(event) => handleMouseMove(event, index)}
            >
              <div className="limited-editions-section-inner">
                <div
                  ref={(el) => {
                    imageWrapperRefs.current[index] = el;
                  }}
                  className="limited-editions-image-wrapper"
                >
                  <img
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                    src={product.image}
                    alt={product.title}
                    className="limited-editions-image"
                    loading="lazy"
                  />
                </div>
                <div
                  ref={(el) => {
                    textRefs.current[index] = el;
                  }}
                  className="limited-editions-text"
                >
                  <h2 className="limited-editions-product-title">{product.title}</h2>
                  <p className="limited-editions-product-description">{product.description}</p>
                  <Link to={product.href} className="limited-editions-cta">
                    ENTER PIECE →
                  </Link>
                </div>
              </div>
              <span
                ref={(el) => {
                  cursorRefs.current[index] = el;
                }}
                className="limited-editions-cursor"
                aria-hidden="true"
              >
                ENTER
              </span>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
