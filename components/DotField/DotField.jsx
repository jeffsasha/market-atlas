'use client';

// A CSS-only adaptation of the supplied React Bits DotField reference.
// No canvas, pointer listeners, springs, cursor tracking, or render loop.
// Upstream attribution: ../LICENSE.react-bits.md.
import './DotField.css';

/** @param {{ paused?: boolean, className?: string }} props */
export default function DotField({ paused = false, className = '' }) {
  return <div className={`dot-field ${className}`} data-paused={paused} aria-hidden="true"><div className="dot-field__ambient" /></div>;
}
