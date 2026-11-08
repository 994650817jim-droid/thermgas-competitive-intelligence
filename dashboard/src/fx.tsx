/* Lightweight interaction effects, modelled on React Bits patterns (CountUp, SpotlightCard, AnimatedContent).
   Written from scratch with no extra dependencies; all respect prefers-reduced-motion. */
import { Fragment, useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Fires once when the element scrolls into view. */
function useInView<T extends Element>(margin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    // Safety net: never leave content hidden if the observer cannot fire (background tab, print, capture tools).
    const t = window.setTimeout(() => setSeen(true), 1500);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [seen, margin]);
  return [ref, seen] as const;
}

/** Counts from 0 to `to` when visible (React Bits "CountUp" idea). */
export function CountUp({ to, duration = 1100, format = (n: number) => String(Math.round(n)) }: { to: number; duration?: number; format?: (n: number) => string }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [v, setV] = useState(reduced() ? to : 0);
  useEffect(() => {
    if (!seen || reduced()) { if (seen) setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / duration); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const done = window.setTimeout(() => setV(to), duration + 400);   // final value even if frames are throttled
    return () => { cancelAnimationFrame(raf); window.clearTimeout(done); };
  }, [seen, to, duration]);
  return <span ref={ref} className="mono">{format(v)}</span>;
}

/** Card with a soft light that follows the pointer (React Bits "SpotlightCard" idea). */
export function Spotlight({ children, className = '', ...rest }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return <div ref={ref} className={`spot ${className}`} onPointerMove={move} {...rest}>{children}</div>;
}

/** Fades and lifts content in on first view (React Bits "AnimatedContent" idea). */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/** Headline that resolves word by word from a soft blur (React Bits "BlurText / SplitText" idea).
    One deliberate page-load moment; renders plain text instantly under reduced motion. */
export function SplitWords({ text, className = '', step = 70 }: { text: string; className?: string; step?: number }) {
  const [ref, seen] = useInView<HTMLHeadingElement>('0px');
  const words = text.split(' ');
  return (
    <h1 ref={ref} className={`split ${seen ? 'in' : ''} ${className}`} aria-label={text}>
      {words.map((w, i) => <Fragment key={i}><span aria-hidden className="w" style={{ transitionDelay: `${i * step}ms` }}>{w}</span>{i < words.length - 1 ? ' ' : null}</Fragment>)}
    </h1>
  );
}

/** Card that tilts toward the pointer with a soft glare and flips on click / Enter (React Bits "Tilted Card" idea).
    Front and back are both real content; reduced motion turns the tilt off and makes the flip a cross-fade. */
export function TiltCard({ front, back, label, className = '' }: { front: ReactNode; back: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || reduced() || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => { const el = ref.current; if (!el) return; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  return (
    <div ref={ref} className={`tilt ${flipped ? 'flipped' : ''} ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <button type="button" className="tilt-inner" aria-pressed={flipped} aria-label={`${label}: ${flipped ? 'show summary' : 'show full specs'}`} onClick={() => setFlipped(f => !f)}>
        <span className="tilt-face tilt-front" aria-hidden={flipped}>{front}</span>
        <span className="tilt-face tilt-back" aria-hidden={!flipped}>{back}</span>
        <span className="tilt-glare" aria-hidden />
      </button>
    </div>
  );
}
