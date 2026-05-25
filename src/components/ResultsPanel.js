import React from 'react';

const ResultsPanel = ({ results, flowType }) => {
  if (!results) return null;
  
  return (
    <div className="results-section">
      <div className="section-card results-card">
        <h3>
          <span>📊</span> Real-time Calculation Results - {flowType === 'parallel' ? 'Parallel Flow' : 'Counter Flow'}
        </h3>
        
        <div className="results-grid">
          {/* Mass Flow Rates */}
          <div className="result-item">
            <span className="result-label">Mass Flow Hot (ṁH):</span>
            <span className="result-value">{results.mH} <small>kg/s</small></span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Mass Flow Cold (ṁC):</span>
            <span className="result-value">{results.mC} <small>kg/s</small></span>
          </div>
          
          {/* Heat Capacity Rates */}
          <div className="result-item">
            <span className="result-label">Heat Capacity Hot (CH):</span>
            <span className="result-value">{results.CH} <small>kW/°C</small></span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Heat Capacity Cold (CC):</span>
            <span className="result-value">{results.CC} <small>kW/°C</small></span>
          </div>
          
          {/* Heat Transfer Rates */}
          <div className="result-item highlight">
            <span className="result-label">Heat Lost by Hot Water (QH):</span>
            <span className="result-value">{results.QH} <small>W</small></span>
          </div>
          
          <div className="result-item highlight">
            <span className="result-label">Heat Gained by Cold Water (QC):</span>
            <span className="result-value">{results.QC} <small>W</small></span>
          </div>
          
          {/* Average Heat Transfer */}
          <div className="result-item special">
            <span className="result-label">⭐ Average Heat Transfer (QAvg):</span>
            <span className="result-value">{results.QAvg} <small>W</small></span>
          </div>
          
          {/* LMTD */}
          <div className="result-item">
            <span className="result-label">Log Mean Temp Difference (LMTD):</span>
            <span className="result-value">{results.LMTD} <small>°C</small></span>
          </div>
          
          {/* Overall Heat Transfer Coefficient */}
          <div className="result-item">
            <span className="result-label">Overall HT Coefficient (U):</span>
            <span className="result-value">{results.U} <small>W/m²°C</small></span>
          </div>
          
          {/* NTU */}
          <div className="result-item">
            <span className="result-label">Number of Transfer Units (NTU):</span>
            <span className="result-value">{results.NTU}</span>
          </div>
          
          {/* Effectiveness */}
          <div className="result-item special">
            <span className="result-label">🎯 Effectiveness (ε):</span>
            <span className="result-value">{results.effectiveness} <small>%</small></span>
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="performance-summary">
          <h4>Performance Analysis:</h4>
          <div className="summary-bars">
            <div className="summary-item">
              <span>Heat Transfer Efficiency:</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(100, (parseFloat(results.QAvg) / 1000) * 100)}%` }}
                ></div>
              </div>
              <span>{((parseFloat(results.QAvg) / 1000) * 100).toFixed(1)}%</span>
            </div>
            <div className="summary-item">
              <span>Effectiveness Rating:</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill effectiveness-fill" 
                  style={{ width: `${parseFloat(results.effectiveness)}%` }}
                ></div>
              </div>
              <span>{results.effectiveness}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;