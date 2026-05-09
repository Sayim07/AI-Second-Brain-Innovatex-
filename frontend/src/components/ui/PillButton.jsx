import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function PillButton({
  children,
  onClick,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#3B82F6', // default bg-blue-500
  pillColor = '#ffffff', // circle color
  pillTextColor = '#ffffff', // initial text color
  hoveredPillTextColor = '#3B82F6', // hovered text color
  ...props
}) {
  const circleRef = useRef(null);
  const tlRef = useRef(null);
  const activeTweenRef = useRef(null);
  const pillRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      const circle = circleRef.current;
      const pill = pillRef.current;
      if (!circle || !pill) return;

      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`
      });

      const label = pill.querySelector('.pill-label');
      const white = pill.querySelector('.pill-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
      }

      if (white) {
        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
      }

      tlRef.current = tl;
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener('resize', onResize);
  }, [ease, children]);

  const handleEnter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  return (
    <button
      ref={pillRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative overflow-hidden inline-flex items-center justify-center rounded-full box-border font-semibold transition-all group ${className}`}
      style={{
        background: baseColor,
        color: pillTextColor
      }}
      {...props}
    >
      <span
        ref={circleRef}
        className="absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
        style={{
          background: pillColor,
          willChange: 'transform'
        }}
        aria-hidden="true"
      />
      <span className="relative inline-flex items-center justify-center z-[2]">
        <span
          className="pill-label relative z-[2] inline-flex items-center justify-center gap-2"
          style={{ willChange: 'transform' }}
        >
          {children}
        </span>
        <span
          className="pill-label-hover absolute left-1/2 top-0 -translate-x-1/2 z-[3] inline-flex items-center justify-center gap-2 w-full h-full whitespace-nowrap"
          style={{
            color: hoveredPillTextColor,
            willChange: 'transform, opacity'
          }}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    </button>
  );
}
