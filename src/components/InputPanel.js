import React from 'react';

const InputPanel = ({ 
  temperatures, 
  timeData, 
  onTemperatureChange, 
  onTimeChange, 
  onScenarioClick 
}) => {
  return (
    <div className="input-section">
      <div className="section-card">
        <h3>
          <span>🌡️</span> Temperature & Flow Parameters
        </h3>
        
        <div className="input-grid">
          <div className="input-field">
            <label>Hot Water Inlet (tHI)</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                step="0.1" 
                value={temperatures.tHI}
                onChange={(e) => onTemperatureChange('tHI', e.target.value)}
              />
              <span>°C</span>
            </div>
          </div>
          
          <div className="input-field">
            <label>Hot Water Outlet (tHO)</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                step="0.1" 
                value={temperatures.tHO}
                onChange={(e) => onTemperatureChange('tHO', e.target.value)}
              />
              <span>°C</span>
            </div>
          </div>
          
          <div className="input-field">
            <label>Cold Water Inlet (tCI)</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                step="0.1" 
                value={temperatures.tCI}
                onChange={(e) => onTemperatureChange('tCI', e.target.value)}
              />
              <span>°C</span>
            </div>
          </div>
          
          <div className="input-field">
            <label>Cold Water Outlet (tCO)</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                step="0.1" 
                value={temperatures.tCO}
                onChange={(e) => onTemperatureChange('tCO', e.target.value)}
              />
              <span>°C</span>
            </div>
          </div>
          
          <div className="input-field">
            <label>Hot Water Collection Time (tH)</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                step="0.01" 
                value={timeData.tH}
                onChange={(e) => onTimeChange('tH', e.target.value)}
              />
              <span>sec/litre</span>
            </div>
          </div>
          
          <div className="input-field">
            <label>Cold Water Collection Time (tC)</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                step="0.01" 
                value={timeData.tC}
                onChange={(e) => onTimeChange('tC', e.target.value)}
              />
              <span>sec/litre</span>
            </div>
          </div>
        </div>

        <div className="scenario-buttons">
          <button 
            className="scenario-btn scenario-1" 
            onClick={() => onScenarioClick(1)}
          >
            📘 Scenario 1: Standard (65°C/22.5°C)
          </button>
          <button 
            className="scenario-btn scenario-2" 
            onClick={() => onScenarioClick(2)}
          >
            📙 Scenario 2: Higher Temp (72°C/25°C)
          </button>
          <button 
            className="scenario-btn scenario-3" 
            onClick={() => onScenarioClick(3)}
          >
            📕 Scenario 3: Max Diff (80°C/20°C)
          </button>
        </div>
        
        <div className="info-note">
          <p>💡 <strong>Tip:</strong> Change any value - calculations update automatically in real-time!</p>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;