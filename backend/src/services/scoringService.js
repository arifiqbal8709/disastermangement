/**
 * Transparent Disaster Preparedness Scoring Engine
 * Computes composite scores deterministically from verified indicators.
 * Formula:
 *   Score = (0.30 * Warning) + (0.25 * Shelter) + (0.25 * Evacuation) + (0.20 * Medical)
 */

export const ScoringService = {
  calculateScore: ({ warning, shelter, evacuation, medical }) => {
    // If any indicator is missing or invalid, return insufficient data flag
    const hasWarning = typeof warning === 'number' && !isNaN(warning) && warning >= 0 && warning <= 100;
    const hasShelter = typeof shelter === 'number' && !isNaN(shelter) && shelter >= 0 && shelter <= 100;
    const hasEvacuation = typeof evacuation === 'number' && !isNaN(evacuation) && evacuation >= 0 && evacuation <= 100;
    const hasMedical = typeof medical === 'number' && !isNaN(medical) && medical >= 0 && medical <= 100;

    if (!hasWarning || !hasShelter || !hasEvacuation || !hasMedical) {
      return {
        score: null,
        riskLevel: 'Insufficient verified data',
        riskColor: 'slate',
        statusText: 'INSUFFICIENT VERIFIED DATA',
        breakdown: {
          warning: hasWarning ? warning : null,
          shelter: hasShelter ? shelter : null,
          evacuation: hasEvacuation ? evacuation : null,
          medical: hasMedical ? medical : null
        },
        formula: 'S = 0.30*Warning + 0.25*Shelter + 0.25*Evacuation + 0.20*Medical',
        isCalculated: false
      };
    }

    const weightedScore = (0.30 * warning) + (0.25 * shelter) + (0.25 * evacuation) + (0.20 * medical);
    const finalScore = Math.round(weightedScore * 10) / 10;

    let riskLevel = 'Low Risk';
    let riskColor = 'green';
    let statusText = 'SATISFACTORY READINESS';

    if (finalScore < 50) {
      riskLevel = 'Very High Risk';
      riskColor = 'red';
      statusText = 'CRITICAL DEFICIT';
    } else if (finalScore < 70) {
      riskLevel = 'High Risk';
      riskColor = 'orange';
      statusText = 'ELEVATED VULNERABILITY';
    } else if (finalScore < 85) {
      riskLevel = 'Moderate Risk';
      riskColor = 'amber';
      statusText = 'SUBSTANTIAL READINESS';
    }

    return {
      score: finalScore,
      riskLevel,
      riskColor,
      statusText,
      breakdown: {
        warning: Math.round(warning),
        shelter: Math.round(shelter),
        evacuation: Math.round(evacuation),
        medical: Math.round(medical)
      },
      formula: 'S = 0.30*Warning + 0.25*Shelter + 0.25*Evacuation + 0.20*Medical',
      isCalculated: true
    };
  }
};
