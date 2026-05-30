import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  // State Management
  const [flowType, setFlowType] = useState('parallel');
  const [isAnimating, setIsAnimating] = useState(true);
  const [temperatures, setTemperatures] = useState({
    tHI: 65.0,   // Hot water inlet (T₁)
    tHO: 35.0,   // Hot water outlet (T₂)
    tCI: 22.5,   // Cold water inlet (t₁)
    tCO: 47.5    // Cold water outlet (t₂)
  });
  const [timeData, setTimeData] = useState({
    tH: 26.24,   // Time for hot water (sec/litre)
    tC: 57.96    // Time for cold water (sec/litre)
  });
  const [results, setResults] = useState(null);

  // Constants (from PDF specifications)
  const CP = 4187;                    // Specific heat capacity J/kg°C
  const D_OUTER = 0.0125;            // Outer diameter of inner tube (m) = 12.5mm
  const LENGTH = 1.5;                // Length of heat exchanger (m)
  const AREA = Math.PI * D_OUTER * LENGTH;  // Surface area (m²) = πDL

  // Mass flow rate calculation
  const calculateMassFlow = useCallback((time) => {
    return time > 0 ? 1 / time : 0;
  }, []);

  // Heat transfer calculation
  const calculateHeatTransfer = useCallback((massFlow, tempIn, tempOut) => {
    return massFlow * CP * Math.abs(tempIn - tempOut);
  }, []);

  // LMTD for Parallel Flow (from PDF formula)
  const calculateLMTDParallel = useCallback((tHI, tHO, tCI, tCO) => {
    const delta1 = tHI - tCI;
    const delta2 = tHO - tCO;
    if (delta1 === delta2) return delta1;
    if (delta1 <= 0 || delta2 <= 0) return Math.abs((delta1 - delta2) / Math.log(Math.abs(delta1 / delta2)));
    return (delta1 - delta2) / Math.log(delta1 / delta2);
  }, []);

  // LMTD for Counter Flow (from PDF formula)
  const calculateLMTDCounter = useCallback((tHI, tHO, tCI, tCO) => {
    const delta1 = tHI - tCO;
    const delta2 = tHO - tCI;
    if (delta1 === delta2) return delta1;
    if (delta1 <= 0 || delta2 <= 0) return Math.abs((delta1 - delta2) / Math.log(Math.abs(delta1 / delta2)));
    return (delta1 - delta2) / Math.log(delta1 / delta2);
  }, []);

  // Effectiveness calculation (from PDF formula)
  const calculateEffectiveness = useCallback((QAvg, mH, mC, tHI, tCI) => {
    const CH = mH * CP;
    const CC = mC * CP;
    const Cmin = Math.min(CH, CC);
    const denominator = Cmin * (tHI - tCI);
    return denominator !== 0 ? QAvg / denominator : 0;
  }, []);

  // Main calculation function
  const performCalculations = useCallback(() => {
    const { tHI, tHO, tCI, tCO } = temperatures;
    const { tH, tC } = timeData;

    // Mass flow rates
    const mH = calculateMassFlow(tH);
    const mC = calculateMassFlow(tC);

    // Heat transfer rates
    const QH = calculateHeatTransfer(mH, tHI, tHO);
    const QC = calculateHeatTransfer(mC, tCO, tCI);
    const QAvg = (QH + QC) / 2;

    // LMTD based on flow type
    const LMTD = flowType === 'parallel'
      ? calculateLMTDParallel(tHI, tHO, tCI, tCO)
      : calculateLMTDCounter(tHI, tHO, tCI, tCO);

    // Overall heat transfer coefficient
    const U = LMTD !== 0 ? QAvg / (AREA * Math.abs(LMTD)) : 0;

    // Effectiveness
    const effectiveness = calculateEffectiveness(QAvg, mH, mC, tHI, tCI);

    // NTU (Number of Transfer Units)
    const CH_cap = mH * CP;
    const CC_cap = mC * CP;
    const Cmin = Math.min(CH_cap, CC_cap);
    const NTU = Cmin !== 0 ? (AREA * U) / Cmin : 0;

    setResults({
      mH: mH.toFixed(4),
      mC: mC.toFixed(4),
      QH: QH.toFixed(2),
      QC: QC.toFixed(2),
      QAvg: QAvg.toFixed(2),
      LMTD: LMTD.toFixed(2),
      U: U.toFixed(2),
      effectiveness: (effectiveness * 100).toFixed(2),
      NTU: NTU.toFixed(4),
      CH: (CH_cap / 1000).toFixed(2),
      CC: (CC_cap / 1000).toFixed(2)
    });
  }, [temperatures, timeData, flowType, calculateMassFlow, calculateHeatTransfer, calculateLMTDParallel, calculateLMTDCounter, calculateEffectiveness, AREA]);

  // Auto-calculate when inputs change
  useEffect(() => {
    performCalculations();
  }, [performCalculations]);

  // Handle temperature changes
  const handleTemperatureChange = (field, value) => {
    setTemperatures(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  // Handle time changes
  const handleTimeChange = (field, value) => {
    setTimeData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Temperature scenarios based on PDF ranges
  const applyScenario1 = () => {
    if (flowType === 'parallel') {
      setTemperatures({ tHI: 65.0, tHO: 35.0, tCI: 22.5, tCO: 47.5 });
      setTimeData({ tH: 26.24, tC: 57.96 });
    } else {
      setTemperatures({ tHI: 65.0, tHO: 38.0, tCI: 22.5, tCO: 52.0 });
      setTimeData({ tH: 26.24, tC: 57.96 });
    }
  };

  const applyScenario2 = () => {
    if (flowType === 'parallel') {
      setTemperatures({ tHI: 72.0, tHO: 42.0, tCI: 25.0, tCO: 55.0 });
      setTimeData({ tH: 24.0, tC: 50.0 });
    } else {
      setTemperatures({ tHI: 72.0, tHO: 40.0, tCI: 25.0, tCO: 58.0 });
      setTimeData({ tH: 24.0, tC: 50.0 });
    }
  };

  const applyScenario3 = () => {
    if (flowType === 'parallel') {
      setTemperatures({ tHI: 80.0, tHO: 48.0, tCI: 28.0, tCO: 60.0 });
      setTimeData({ tH: 22.0, tC: 45.0 });
    } else {
      setTemperatures({ tHI: 80.0, tHO: 45.0, tCI: 28.0, tCO: 65.0 });
      setTimeData({ tH: 22.0, tC: 45.0 });
    }
  };

  // Get image source based on flow type
  const getImageSrc = () => {
    if (flowType === 'parallel') {
      return '/images/heat-exchanger-diagram.png';
    } else {
      return '/images/counter-flow-he.jpeg'
    }
  };

  return ( 
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>
          <span className="icon">🔥</span>
          CONCENTRIC TUBE PARALLEL / COUNTER FLOW HEAT EXCHANGER
          <span className="icon">💧</span>
        </h1>
        <p>ANIMATION DIAGRAM | Real-time Calculations | Temperature Range: T₁ 65-95°C | P = 1 bar (Constant)</p>
      </header>

      {/* Flow Type Selector */}
      <div className="flow-selector">
        <button 
          className={`flow-btn ${flowType === 'parallel' ? 'active' : ''}`}
          onClick={() => setFlowType('parallel')}
        >
          <span>🔄</span> PARALLEL FLOW
        </button>
        <button 
          className={`flow-btn ${flowType === 'counter' ? 'active' : ''}`}
          onClick={() => setFlowType('counter')}
        >
          <span>⚡</span> COUNTER FLOW
        </button>
        <button className="animate-toggle" onClick={toggleAnimation}>
          {isAnimating ? '⏸️ PAUSE ANIMATION' : '▶️ START ANIMATION'}
        </button>
      </div>

      {/* Main Diagram Section with Image */}
      <div className="diagram-section">
        <div className="diagram-container">
          <img
            src={getImageSrc()}
            alt={`${flowType === 'parallel' ? 'Parallel' : 'Counter'} Flow Heat Exchanger Diagram`}
            className="exchanger-diagram"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/1200x650/1a1a2e/ffffff?text=${flowType === 'parallel' ? 'Parallel' : 'Counter'}+Flow+Heat+Exchanger`;
            }}
          />
          
          {/* Animated Arrows Overlay - BLUE ARROWS moved DOWN in both modes */}
          <svg className="animated-arrows-overlay" viewBox="0 0 1200 650" preserveAspectRatio="none">
            <defs>
              <marker id="arrowRedSmall" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#ef4444"/>
              </marker>
              <marker id="arrowBlueSmall" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#3b82f6"/>
              </marker>
            </defs>

            {flowType === 'parallel' ? (
              <>
                {/* PARALLEL FLOW - BLUE ARROWS moved DOWN to y=215 (was 194) */}
                {isAnimating && (
                  <>
                    {/* Hot water (Blue) left to right - MOVED DOWN */}
                    <g className="arrow-animate right delay-1">
                      <line x1="220" y1="215" x2="400" y2="215" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlueSmall)"/>
                    </g>
                    <g className="arrow-animate right delay-2">
                      <line x1="440" y1="215" x2="620" y2="215" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlueSmall)"/>
                    </g>
                    <g className="arrow-animate right delay-3">
                      <line x1="660" y1="215" x2="840" y2="215" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlueSmall)"/>
                    </g>
                    
                    {/* Cold water (Red) left to right - NO CHANGE (y=266) */}
                    <g className="arrow-animate right delay-2">
                      <line x1="220" y1="266" x2="400" y2="266" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRedSmall)"/>
                    </g>
                    <g className="arrow-animate right delay-3">
                      <line x1="440" y1="266" x2="620" y2="266" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRedSmall)"/>
                    </g>
                    <g className="arrow-animate right">
                      <line x1="660" y1="266" x2="840" y2="266" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRedSmall)"/>
                    </g>
                  </>
                )}
              </>
            ) : (
              <>
                {/* COUNTER FLOW - BLUE ARROWS moved DOWN to y=215 (was 194) */}
                {isAnimating && (
                  <>
                    {/* Hot water (BLUE) - RIGHT to LEFT - MOVED DOWN */}
                    <g className="arrow-animate left">
                      <line x1="840" y1="215" x2="660" y2="215" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlueSmall)"/>
                    </g>
                    <g className="arrow-animate left delay-1">
                      <line x1="620" y1="215" x2="440" y2="215" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlueSmall)"/>
                    </g>
                    <g className="arrow-animate left delay-2">
                      <line x1="400" y1="215" x2="220" y2="215" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlueSmall)"/>
                    </g>
                    
                    {/* Cold water (RED) - LEFT to RIGHT - NO CHANGE (y=266) */}
                    <g className="arrow-animate right delay-1">
                      <line x1="220" y1="266" x2="400" y2="266" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRedSmall)"/>
                    </g>
                    <g className="arrow-animate right delay-2">
                      <line x1="440" y1="266" x2="620" y2="266" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRedSmall)"/>
                    </g>
                    <g className="arrow-animate right delay-3">
                      <line x1="660" y1="266" x2="840" y2="266" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRedSmall)"/>
                    </g>
                  </>
                )}
              </>
            )}
          </svg>

          {/* Temperature Display Overlay on Diagram */}
          <div className="diagram-temp-labels">
            <div className="temp-hot-in">🔥 T₁: {temperatures.tHI}°C</div>
            <div className="temp-hot-out">🔥 T₂: {temperatures.tHO}°C</div>
            <div className="temp-cold-in">💧 t₁: {temperatures.tCI}°C</div>
            <div className="temp-cold-out">💧 t₂: {temperatures.tCO}°C</div>
          </div>
        </div>
      </div>

      {/* Input Controls Section */}
      <div className="input-section">
        <div className="section-card">
          <h3>🌡️ TEMPERATURE & FLOW RATE PARAMETERS</h3>
          <div className="input-grid">
            <div className="input-field">
              <label>Hot Water Inlet T₁ (°C)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  value={temperatures.tHI}
                  onChange={(e) => handleTemperatureChange('tHI', e.target.value)}
                />
                <span>°C</span>
              </div>
            </div>
            <div className="input-field">
              <label>Hot Water Outlet T₂ (°C)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  value={temperatures.tHO}
                  onChange={(e) => handleTemperatureChange('tHO', e.target.value)}
                />
                <span>°C</span>
              </div>
            </div>
            <div className="input-field">
              <label>Cold Water Inlet t₁ (°C)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  value={temperatures.tCI}
                  onChange={(e) => handleTemperatureChange('tCI', e.target.value)}
                />
                <span>°C</span>
              </div>
            </div>
            <div className="input-field">
              <label>Cold Water Outlet t₂ (°C)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.1" 
                  value={temperatures.tCO}
                  onChange={(e) => handleTemperatureChange('tCO', e.target.value)}
                />
                <span>°C</span>
              </div>
            </div>
            <div className="input-field">
              <label>Hot Water Collection Time tH (sec/litre)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.01" 
                  value={timeData.tH}
                  onChange={(e) => handleTimeChange('tH', e.target.value)}
                />
                <span>sec/litre</span>
              </div>
            </div>
            <div className="input-field">
              <label>Cold Water Collection Time tC (sec/litre)</label>
              <div className="input-with-unit">
                <input 
                  type="number" 
                  step="0.01" 
                  value={timeData.tC}
                  onChange={(e) => handleTimeChange('tC', e.target.value)}
                />
                <span>sec/litre</span>
              </div>
            </div>
          </div>

          <div className="scenario-buttons">
            <button className="scenario-btn scenario-1" onClick={applyScenario1}>
              📘 Scenario 1: 65°C (Standard)
            </button>
            <button className="scenario-btn scenario-2" onClick={applyScenario2}>
              📙 Scenario 2: 72°C (Medium)
            </button>
            <button className="scenario-btn scenario-3" onClick={applyScenario3}>
              📕 Scenario 3: 80°C (High)
            </button>
          </div>
        </div>
      </div>

      {/* Results & Tabulation Section */}
      {results && (
        <div className="results-section">
          <div className="section-card results-card">
            <h3>📊 CALCULATION RESULTS & TABULATION</h3>
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Mass Flow Hot (ṁH):</span>
                <span className="result-value">{results.mH} <small>kg/s</small></span>
              </div>
              <div className="result-item">
                <span className="result-label">Mass Flow Cold (ṁC):</span>
                <span className="result-value">{results.mC} <small>kg/s</small></span>
              </div>
              <div className="result-item">
                <span className="result-label">Heat Capacity Hot (CH):</span>
                <span className="result-value">{results.CH} <small>kW/°C</small></span>
              </div>
              <div className="result-item">
                <span className="result-label">Heat Capacity Cold (CC):</span>
                <span className="result-value">{results.CC} <small>kW/°C</small></span>
              </div>
              <div className="result-item highlight">
                <span className="result-label">Heat Lost by Hot (QH):</span>
                <span className="result-value">{results.QH} <small>W</small></span>
              </div>
              <div className="result-item highlight">
                <span className="result-label">Heat Gained by Cold (QC):</span>
                <span className="result-value">{results.QC} <small>W</small></span>
              </div>
              <div className="result-item special">
                <span className="result-label">⭐ Average Heat Transfer (QAvg):</span>
                <span className="result-value">{results.QAvg} <small>W</small></span>
              </div>
              <div className="result-item">
                <span className="result-label">Log Mean Temp Diff (LMTD):</span>
                <span className="result-value">{results.LMTD} <small>°C</small></span>
              </div>
              <div className="result-item">
                <span className="result-label">Overall HT Coefficient (U):</span>
                <span className="result-value">{results.U} <small>W/m²°C</small></span>
              </div>
              <div className="result-item">
                <span className="result-label">Number of Transfer Units (NTU):</span>
                <span className="result-value">{results.NTU}</span>
              </div>
              <div className="result-item special">
                <span className="result-label">🎯 Effectiveness (ε):</span>
                <span className="result-value">{results.effectiveness} <small>%</small></span>
              </div>
            </div>

            {/* Tabulation Table */}
            <div className="tabulation-table">
              <h4>📋 OBSERVATION TABULATION</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>T₁ (°C)</th>
                    <th>T₂ (°C)</th>
                    <th>t₁ (°C)</th>
                    <th>t₂ (°C)</th>
                    <th>ṁH (kg/s)</th>
                    <th>ṁC (kg/s)</th>
                    <th>QH (W)</th>
                    <th>QC (W)</th>
                    <th>QAvg (W)</th>
                    <th>LMTD (°C)</th>
                    <th>U (W/m²°C)</th>
                    <th>ε (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>{temperatures.tHI}</td>
                    <td>{temperatures.tHO}</td>
                    <td>{temperatures.tCI}</td>
                    <td>{temperatures.tCO}</td>
                    <td>{results.mH}</td>
                    <td>{results.mC}</td>
                    <td>{results.QH}</td>
                    <td>{results.QC}</td>
                    <td>{results.QAvg}</td>
                    <td>{results.LMTD}</td>
                    <td>{results.U}</td>
                    <td>{results.effectiveness}</td>
                  </tr>
                  <tr className="sample-row">
                    <td>2</td>
                    <td>70.0</td>
                    <td>40.0</td>
                    <td>24.0</td>
                    <td>50.0</td>
                    <td>0.0417</td>
                    <td>0.0200</td>
                    <td>525.0</td>
                    <td>545.0</td>
                    <td>535.0</td>
                    <td>21.5</td>
                    <td>850.0</td>
                    <td>32.5</td>
                  </tr>
                  <tr className="sample-row">
                    <td>3</td>
                    <td>75.0</td>
                    <td>45.0</td>
                    <td>25.0</td>
                    <td>55.0</td>
                    <td>0.0455</td>
                    <td>0.0222</td>
                    <td>587.0</td>
                    <td>610.0</td>
                    <td>598.5</td>
                    <td>22.8</td>
                    <td>895.0</td>
                    <td>35.2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Valve Status Display */}
      <div className="valve-status">
        <div className="section-card">
          <h3>🔧 VALVE POSITIONS</h3>
          <div className="valve-grid">
            <div className={`valve-item ${flowType === 'parallel' ? 'closed' : 'open'}`}>
              <span className="valve-number">Valve 1</span>
              <span className="valve-status-text">{flowType === 'parallel' ? 'CLOSED' : 'OPEN'}</span>
            </div>
            <div className={`valve-item ${flowType === 'parallel' ? 'open' : 'closed'}`}>
              <span className="valve-number">Valve 2</span>
              <span className="valve-status-text">{flowType === 'parallel' ? 'OPEN' : 'CLOSED'}</span>
            </div>
            <div className={`valve-item ${flowType === 'parallel' ? 'closed' : 'open'}`}>
              <span className="valve-number">Valve 3</span>
              <span className="valve-status-text">{flowType === 'parallel' ? 'CLOSED' : 'OPEN'}</span>
            </div>
            <div className={`valve-item ${flowType === 'parallel' ? 'open' : 'closed'}`}>
              <span className="valve-number">Valve 4</span>
              <span className="valve-status-text">{flowType === 'parallel' ? 'OPEN' : 'CLOSED'}</span>
            </div>
            <div className="valve-item open">
              <span className="valve-number">Valve 5</span>
              <span className="valve-status-text">OPEN (Both)</span>
            </div>
            <div className="valve-item open">
              <span className="valve-number">Valve 6</span>
              <span className="valve-status-text">OPEN (Both)</span>
            </div>
          </div>
          <div className="flow-type-note">
            <p>{flowType === 'parallel' 
              ? '🔄 PARALLEL FLOW: Valves 2, 4, 5, 6 → OPEN | Valves 1, 3 → CLOSED'
              : '⚡ COUNTER FLOW: Valves 1, 3, 5, 6 → OPEN | Valves 2, 4 → CLOSED'}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Heat Exchanger Analysis System | P = 1 bar (Constant) | Temperature Range: T₁ 65-95°C | Real-time Calculations | Live Animations</p>
      </footer>
    </div>
  );
};

export default App;