import React from 'react';

const AnimatedArrows = ({ flowType }) => {
  return (
    <svg className="animated-arrows-overlay" viewBox="0 0 1000 500" preserveAspectRatio="none">
      <defs>
        <marker id="arrowRed" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5"/>
        </marker>
        <marker id="arrowBlue" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.5"/>
        </marker>
        <marker id="arrowGreen" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" fill="#10b981" stroke="#064e3b" strokeWidth="0.5"/>
        </marker>
        <marker id="arrowOrange" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="0.5"/>
        </marker>
        <marker id="arrowPurple" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="0.5"/>
        </marker>
        <marker id="arrowPink" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M0,0 L12,6 L0,12 Z" fill="#ec4899" stroke="#be185d" strokeWidth="0.5"/>
        </marker>
      </defs>

      {flowType === 'parallel' ? (
        <>
          {/* Parallel Flow Arrows - 6 Arrows Animation */}
          <g className="arrow-animate right">
            <line x1="160" y1="95" x2="400" y2="95" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
          </g>
          <g className="arrow-animate right delay-1">
            <line x1="160" y1="130" x2="400" y2="130" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
          </g>
          <g className="arrow-animate right delay-2">
            <line x1="280" y1="190" x2="520" y2="190" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
          </g>
          <g className="arrow-animate right delay-3">
            <line x1="280" y1="230" x2="520" y2="230" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
          </g>
          <g className="arrow-animate right delay-1">
            <line x1="280" y1="270" x2="520" y2="270" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowGreen)"/>
          </g>
          <g className="arrow-animate down">
            <line x1="720" y1="310" x2="720" y2="380" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowOrange)"/>
          </g>
        </>
      ) : (
        <>
          {/* Counter Flow Arrows - 6 Arrows Animation */}
          <g className="arrow-animate left">
            <line x1="780" y1="95" x2="540" y2="95" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
          </g>
          <g className="arrow-animate right">
            <line x1="160" y1="130" x2="400" y2="130" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
          </g>
          <g className="arrow-animate left delay-1">
            <line x1="650" y1="190" x2="410" y2="190" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
          </g>
          <g className="arrow-animate right delay-2">
            <line x1="280" y1="230" x2="520" y2="230" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
          </g>
          <g className="arrow-animate right delay-3">
            <line x1="280" y1="270" x2="520" y2="270" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowGreen)"/>
          </g>
          <g className="arrow-animate left delay-2">
            <line x1="720" y1="380" x2="720" y2="310" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowPurple)"/>
          </g>
        </>
      )}
    </svg>
  );
};

export default AnimatedArrows;