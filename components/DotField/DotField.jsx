'use client';

// Adapted from the user-supplied React Bits DotField. Instead of isolated
// dots, connect neighboring spring points into a continuous, deformable grid.
// See ../LICENSE.react-bits.md for upstream terms.
import { memo, useEffect, useRef } from 'react';
import './DotField.css';

const DotField = memo(
/** @param {{ dotSpacing?: number, bulgeStrength?: number, cursorRadius?: number, glowRadius?: number, waveAmplitude?: number, paused?: boolean, className?: string }} props */
function DotField({
  dotSpacing = 34,
  bulgeStrength = 67,
  cursorRadius = 240,
  glowRadius = 160,
  waveAmplitude = 0,
  paused = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const settings = useRef({ dotSpacing, bulgeStrength, cursorRadius, glowRadius, waveAmplitude });
  const rebuild = useRef(null);
  settings.current = { dotSpacing, bulgeStrength, cursorRadius, glowRadius, waveAmplitude };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!container || !canvas || !ctx || paused) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = { x: -9999, y: -9999, previousX: -9999, previousY: -9999, speed: 0 };
    let width = 0, height = 0, columns = 0, rows = 0, points = [];
    let frame = 0, engagement = 0, time = 0, last = 0, visible = true;
    let gradientFrom = '', gradientTo = '', glowColor = '';

    function colors() {
      const styles = getComputedStyle(container);
      gradientFrom = styles.getPropertyValue('--grid-from').trim();
      gradientTo = styles.getPropertyValue('--grid-to').trim();
      glowColor = styles.getPropertyValue('--grid-glow').trim();
    }

    function measure() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Bound the mesh on very large displays while retaining square cells.
      const step = Math.max(12, settings.current.dotSpacing, Math.sqrt(width * height / 1800));
      columns = Math.ceil(width / step) + 1;
      rows = Math.ceil(height / step) + 1;
      const padX = (width - (columns - 1) * step) / 2;
      const padY = (height - (rows - 1) * step) / 2;
      points = Array.from({ length: columns * rows }, (_, index) => {
        const ax = padX + (index % columns) * step;
        const ay = padY + Math.floor(index / columns) * step;
        return { ax, ay, x: ax, y: ay };
      });
      colors();
      draw();
      wake();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      if (!width || !height) return;
      const gradient = ctx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, gradientFrom);
      gradient.addColorStop(1, gradientTo);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = .7;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index % columns < columns - 1) {
          const next = points[index + 1];
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(next.x, next.y);
        }
        if (index + columns < points.length) {
          const next = points[index + columns];
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(next.x, next.y);
        }
      });
      ctx.stroke();
      if (engagement > .005) {
        const radius = Math.max(1, settings.current.glowRadius);
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
        glow.addColorStop(0, glowColor);
        glow.addColorStop(1, 'transparent');
        ctx.globalAlpha = engagement;
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    }

    function tick(timestamp) {
      frame = 0;
      if (!visible || document.hidden || preference.matches) return;
      const dt = Math.min((timestamp - (last || timestamp)) / 16.67, 2) || 1;
      last = timestamp;
      time += dt * .02;
      const distance = Math.hypot(mouse.x - mouse.previousX, mouse.y - mouse.previousY);
      mouse.speed += (Math.min(distance, 50) - mouse.speed) * .4;
      mouse.previousX = mouse.x;
      mouse.previousY = mouse.y;
      engagement += (Math.min(mouse.speed / 5, 1) - engagement) * .08;
      let moving = false;
      const config = settings.current;
      const radius = Math.max(1, config.cursorRadius);
      points.forEach(point => {
        const dx = mouse.x - point.ax, dy = mouse.y - point.ay;
        const dist = Math.hypot(dx, dy);
        const push = dist < radius ? (1 - dist / radius) ** 2 * config.bulgeStrength * engagement : 0;
        const wave = config.waveAmplitude * Math.sin(point.ax * .025 + time);
        const targetX = point.ax - (dist ? dx / dist : 0) * push;
        const targetY = point.ay - (dist ? dy / dist : 0) * push + wave;
        const ease = 1 - .85 ** dt;
        point.x += (targetX - point.x) * ease;
        point.y += (targetY - point.y) * ease;
        if (Math.abs(targetX - point.x) + Math.abs(targetY - point.y) > .05) moving = true;
      });
      draw();
      if (moving || engagement > .001 || mouse.speed > .01 || config.waveAmplitude > 0) wake();
    }

    function wake() {
      if (!frame && visible && !document.hidden && !preference.matches) frame = requestAnimationFrame(tick);
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
    function onPointerMove(event) {
      if (event.pointerType === 'touch') return;
      const rect = container.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      wake();
    }
    function onLeave() { mouse.speed = 0; engagement = 0; mouse.x = mouse.y = mouse.previousX = mouse.previousY = -9999; wake(); }
    function onVisibility() { if (document.hidden) stop(); else wake(); }
    function onPreference() { stop(); engagement = 0; measure(); }

    const resize = new ResizeObserver(measure);
    resize.observe(container);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake(); else stop();
    });
    intersection.observe(container);
    const theme = new MutationObserver(() => { colors(); draw(); wake(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    preference.addEventListener('change', onPreference);
    rebuild.current = measure;
    measure();
    return () => {
      stop();
      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      preference.removeEventListener('change', onPreference);
      rebuild.current = null;
    };
  }, [paused]);

  useEffect(() => { rebuild.current?.(); }, [dotSpacing]);

  return <div ref={containerRef} className={`dot-field-container ${className}`} aria-hidden="true"><canvas ref={canvasRef} /></div>;
});

export default DotField;
