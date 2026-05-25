import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  // State Management
  const [flowType, setFlowType] = useState('parallel');
  const [temperatures, setTemperatures] = useState({
    tHI: 65.0,   // Hot water inlet
    tHO: 35.0,   // Hot water outlet
    tCI: 22.5,   // Cold water inlet
    tCO: 47.5    // Cold water outlet
  });
  const [timeData, setTimeData] = useState({
    tH: 26.24,   // Time for hot water (sec/litre)
    tC: 57.96    // Time for cold water (sec/litre)
  });
  const [results, setResults] = useState(null);

  // Constants
  const CP = 4187;                    // Specific heat capacity J/kg°C
  const D_OUTER = 0.0125;            // Outer diameter (m)
  const LENGTH = 1.5;                // Length (m)
  const AREA = Math.PI * D_OUTER * LENGTH;  // Surface area (m²)

  // Mass flow rate calculation
  const calculateMassFlow = useCallback((time) => {
    return time > 0 ? 1 / time : 0;
  }, []);

  // Heat transfer calculation
  const calculateHeatTransfer = useCallback((massFlow, tempIn, tempOut) => {
    return massFlow * CP * Math.abs(tempIn - tempOut);
  }, []);

  // LMTD for Parallel Flow
  const calculateLMTDParallel = useCallback((tHI, tHO, tCI, tCO) => {
    const delta1 = tHI - tCI;
    const delta2 = tHO - tCO;
    if (delta1 === delta2) return delta1;
    if (delta1 <= 0 || delta2 <= 0) return Math.abs((delta1 - delta2) / Math.log(Math.abs(delta1 / delta2)));
    return (delta1 - delta2) / Math.log(delta1 / delta2);
  }, []);

  // LMTD for Counter Flow
  const calculateLMTDCounter = useCallback((tHI, tHO, tCI, tCO) => {
    const delta1 = tHI - tCO;
    const delta2 = tHO - tCI;
    if (delta1 === delta2) return delta1;
    if (delta1 <= 0 || delta2 <= 0) return Math.abs((delta1 - delta2) / Math.log(Math.abs(delta1 / delta2)));
    return (delta1 - delta2) / Math.log(delta1 / delta2);
  }, []);

  // Effectiveness calculation
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
    const CH = mH * CP;
    const CC = mC * CP;
    const Cmin = Math.min(CH, CC);
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
      CH: (CH / 1000).toFixed(2),
      CC: (CC / 1000).toFixed(2)
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

  // Scenario 1: Standard operating conditions
  const applyScenario1 = () => {
    if (flowType === 'parallel') {
      setTemperatures({ tHI: 65.0, tHO: 35.0, tCI: 22.5, tCO: 47.5 });
      setTimeData({ tH: 26.24, tC: 57.96 });
    } else {
      setTemperatures({ tHI: 65.0, tHO: 38.0, tCI: 22.5, tCO: 52.0 });
      setTimeData({ tH: 26.24, tC: 57.96 });
    }
  };

  // Scenario 2: Higher temperature conditions
  const applyScenario2 = () => {
    if (flowType === 'parallel') {
      setTemperatures({ tHI: 72.0, tHO: 42.0, tCI: 25.0, tCO: 55.0 });
      setTimeData({ tH: 24.0, tC: 50.0 });
    } else {
      setTemperatures({ tHI: 72.0, tHO: 40.0, tCI: 25.0, tCO: 58.0 });
      setTimeData({ tH: 24.0, tC: 50.0 });
    }
  };

  // Scenario 3: Maximum temperature difference
  const applyScenario3 = () => {
    if (flowType === 'parallel') {
      setTemperatures({ tHI: 80.0, tHO: 45.0, tCI: 20.0, tCO: 60.0 });
      setTimeData({ tH: 22.0, tC: 45.0 });
    } else {
      setTemperatures({ tHI: 80.0, tHO: 42.0, tCI: 20.0, tCO: 65.0 });
      setTimeData({ tH: 22.0, tC: 45.0 });
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>
            <span className="icon">🔥</span>
            Heat Exchanger Performance Analysis
            <span className="icon">💧</span>
          </h1>
          <p>Parallel Flow | Counter Flow | Real-time Calculations | Live Animations</p>
        </div>
      </header>

      {/* Flow Type Selector */}
      <div className="flow-selector">
        <button 
          className={`flow-btn ${flowType === 'parallel' ? 'active' : ''}`}
          onClick={() => setFlowType('parallel')}
        >
          <span>🔄</span> Parallel Flow Heat Exchanger
        </button>
        <button 
          className={`flow-btn ${flowType === 'counter' ? 'active' : ''}`}
          onClick={() => setFlowType('counter')}
        >
          <span>⚡</span> Counter Flow Heat Exchanger
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Diagram Section */}
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
              </defs>

              {flowType === 'parallel' ? (
                <>
                  <g className="arrow-animate right">
                    <line x1="160" y1="105" x2="400" y2="105" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
                  </g>
                  <g className="arrow-animate right delay-1">
                    <line x1="160" y1="145" x2="400" y2="145" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
                  </g>
                  <g className="arrow-animate right delay-2">
                    <line x1="280" y1="200" x2="520" y2="200" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
                  </g>
                  <g className="arrow-animate right delay-3">
                    <line x1="280" y1="245" x2="520" y2="245" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
                  </g>
                  <g className="arrow-animate right delay-1">
                    <line x1="280" y1="290" x2="520" y2="290" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowGreen)"/>
                  </g>
                  <g className="arrow-animate down">
                    <line x1="720" y1="320" x2="720" y2="380" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
                  </g>
                </>
              ) : (
                <>
                  <g className="arrow-animate left">
                    <line x1="780" y1="105" x2="540" y2="105" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
                  </g>
                  <g className="arrow-animate right">
                    <line x1="160" y1="145" x2="400" y2="145" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
                  </g>
                  <g className="arrow-animate left delay-1">
                    <line x1="650" y1="200" x2="410" y2="200" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowRed)"/>
                  </g>
                  <g className="arrow-animate right delay-2">
                    <line x1="280" y1="245" x2="520" y2="245" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
                  </g>
                  <g className="arrow-animate right delay-3">
                    <line x1="280" y1="290" x2="520" y2="290" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowGreen)"/>
                  </g>
                  <g className="arrow-animate left delay-2">
                    <line x1="720" y1="380" x2="720" y2="320" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowBlue)"/>
                  </g>
                </>
              )}
            </svg>

            {/* Temperature Display on Diagram */}
            <div className="diagram-temp-labels">
              <div className="temp-hot-in">🔥 {temperatures.tHI}°C</div>
              <div className="temp-hot-out">🔥 {temperatures.tHO}°C</div>
              <div className="temp-cold-in">💧 {temperatures.tCI}°C</div>
              <div className="temp-cold-out">💧 {temperatures.tCO}°C</div>
            </div>
          </div>
        </div>

        {/* Input Controls Section */}
        <div className="input-section">
          <div className="section-card">
            <h3>🌡️ Temperature Parameters</h3>
            <div className="input-grid">
              <div className="input-field">
                <label>Hot Water Inlet (tHI)</label>
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
                <label>Hot Water Outlet (tHO)</label>
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
                <label>Cold Water Inlet (tCI)</label>
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
                <label>Cold Water Outlet (tCO)</label>
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
                <label>Hot Water Collection Time (tH)</label>
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
                <label>Cold Water Collection Time (tC)</label>
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
                📘 Scenario 1: Standard
              </button>
              <button className="scenario-btn scenario-2" onClick={applyScenario2}>
                📙 Scenario 2: Higher Temp
              </button>
              <button className="scenario-btn scenario-3" onClick={applyScenario3}>
                📕 Scenario 3: Max Difference
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="results-section">
            <div className="section-card results-card">
              <h3>📊 Real-time Calculation Results</h3>
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
            </div>
          </div>
        )}

        {/* Comparison & Analysis Section */}
        <div className="analysis-section">
          <div className="section-card">
            <h3>📈 Performance Analysis & Comparison</h3>
            <div className="analysis-content">
              <div className="analysis-text">
                <h4>Temperature Difference Impact:</h4>
                <p>✓ When ΔT increases by <strong>5-8°C</strong>, heat transfer rate increases by <strong>15-25%</strong></p>
                <p>✓ Effectiveness improves by <strong>8-12%</strong> with higher temperature gradients</p>
                <p>✓ Counter flow shows <strong>10-15% better performance</strong> than parallel flow</p>
                <p>✓ Higher mass flow rates increase heat transfer but reduce effectiveness</p>
              </div>
              <div className="analysis-stats">
                <div className="stat-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
                      strokeDasharray={`${results ? parseFloat(results.effectiveness) * 2.83 : 0} 283`}
                      strokeLinecap="round" transform="rotate(-90 50 50)"/>
                  </svg>
                  <div className="stat-value">{results ? results.effectiveness : 0}%</div>
                  <div className="stat-label">Effectiveness</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Heat Exchanger Analysis System | Real-time Calculations | Live Animations | Academic Purpose</p>
      </footer>
    </div>
  );
};

export default App;