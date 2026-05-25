import React from 'react';
import AnimatedArrows from './AnimatedArrows';

const HeatExchangerDiagram = ({ flowType, temperatures }) => {
  return (
    <div className="diagram-section">
      <div className="diagram-container">
        <img
          src={`/images/${flowType === 'parallel' ? 'parallel-flow-he' : 'counter-flow-he'}.jpeg`}
          alt={`${flowType.charAt(0).toUpperCase() + flowType.slice(1)} Flow Heat Exchanger`}
          className="exchanger-diagram"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/900x500/1e293b/ffffff?text=${flowType.charAt(0).toUpperCase() + flowType.slice(1)}+Flow+Heat+Exchanger`;
          }}
        />
        
        {/* Animated Arrows Overlay */}
        <AnimatedArrows flowType={flowType} />
        
        {/* Temperature Display on Diagram */}
        <div className="diagram-temp-labels">
          <div className="temp-hot-in">🔥 {temperatures.tHI}°C</div>
          <div className="temp-hot-out">🔥 {temperatures.tHO}°C</div>
          <div className="temp-cold-in">💧 {temperatures.tCI}°C</div>
          <div className="temp-cold-out">💧 {temperatures.tCO}°C</div>
        </div>
      </div>
    </div>
  );
};

export default HeatExchangerDiagram;