import { SupabaseService } from './supabaseService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let genAI = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
}

export const IntelligenceService = {
  /**
   * AI Disaster Risk Intelligence Evaluator
   * Computes multi-hazard compound risk score and synthesizes verified
   * recommendations using Gemini 1.5 Flash.
   */
  assessRisk: async ({ districtId, hazardType = 'Flood' }) => {
    const district = await SupabaseService.getDistrictById(districtId);
    if (!district) {
      throw new Error(`District '${districtId}' not found.`);
    }

    const shelters = await SupabaseService.getShelters(district.name);
    const incidents = await SupabaseService.getHistoricalIncidents(district.name);
    const memories = await SupabaseService.getDisasterMemory(district.name);
    const alerts = await SupabaseService.getAlerts(district.id);

    // Compute vulnerability metrics
    const shelterCapacityTotal = shelters.reduce((acc, s) => acc + (parseInt(s.capacity) || 0), 0);
    const shelterScore = Math.min(100, Math.round((shelterCapacityTotal / 4000) * 100)) || 55;
    const historyIntensity = Math.min(100, incidents.length * 28 + (memories.length * 15)) || 65;
    
    // Check active alerts severity
    let alertWeight = 10;
    if (alerts.some(a => a.severity === 'Red')) alertWeight = 95;
    else if (alerts.some(a => a.severity === 'Orange')) alertWeight = 75;
    else if (alerts.some(a => a.severity === 'Yellow')) alertWeight = 45;

    // Composite Multi-hazard Score: S = 0.35 Alert + 0.30 History + 0.20 ShelterDeficit + 0.15 RouteExposure
    const shelterDeficitFactor = Math.max(10, 100 - shelterScore);
    const routeExposureFactor = district.vulnerable_routes ? 80 : 40;
    
    const compositeScore = parseFloat(
      (0.35 * alertWeight + 0.30 * historyIntensity + 0.20 * shelterDeficitFactor + 0.15 * routeExposureFactor).toFixed(1)
    );

    const riskTier = 
      compositeScore >= 75 ? 'Extreme' :
      compositeScore >= 55 ? 'High' :
      compositeScore >= 35 ? 'Moderate' : 'Low';

    const subScores = {
      hydrologicalVulnerability: Math.min(98, Math.round(alertWeight * 0.9 + 10)),
      structuralVulnerability: Math.min(95, Math.round(shelterDeficitFactor * 0.85 + 15)),
      evacuationVulnerability: routeExposureFactor,
      demographicExposure: Math.min(90, Math.round(historyIntensity * 0.75 + 20))
    };

    const keyFindings = [
      `Compound vulnerability index calculated at ${compositeScore}/100 (${riskTier} Risk Tier).`,
      `District historical memory records ${incidents.length} major verified disaster events on record.`,
      `Shelter availability covers ${shelterCapacityTotal.toLocaleString('en-IN')} persons across ${shelters.length} mapped facilities.`,
      `Critical transit choke-point: ${district.vulnerable_routes || 'Low-lying river crossings'}.`
    ];

    const mitigationDirectives = [
      {
        priority: 'P1 - Immediate',
        action: 'Deploy pre-positioned mobile satellite communication and siren units along vulnerable transit lines.',
        department: 'District Emergency Operations Center (DEOC) & Police Telecommunications'
      },
      {
        priority: 'P2 - 24 Hours',
        action: 'Pre-allocate SDRF quick-response squads to multi-purpose relief camps on high plinths.',
        department: 'State Disaster Response Force (SDRF)'
      },
      {
        priority: 'P3 - Structural',
        action: 'Conduct ultrasonic scouring audits on arterial bridge abutments prior to peak monsoon surge.',
        department: 'Public Works Department (Roads & Bridges)'
      }
    ];

    // Optional Gemini 1.5 Flash Enhancement
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a Chief Disaster Intelligence Specialist at NDMA India.
Analyze this district data and return a JSON object with:
"executiveSummary": string (max 60 words),
"priorityDirectives": array of 3 strings (actionable and specific).

Data:
- District: ${district.name}, State: ${district.state}
- Hazard: ${hazardType}
- Composite Risk Score: ${compositeScore} / 100 (${riskTier})
- Historical Memory: ${district.historical_events_summary || 'Monsoon river overflow'}
- Active Warnings: ${alerts.map(a => a.headline).join('; ') || 'Normal monitoring'}

Output strictly valid JSON with no markdown formatting.`;

        const response = await model.generateContent(prompt);
        const rawText = response.response.text();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.executiveSummary) {
            keyFindings.unshift(parsed.executiveSummary);
          }
          if (Array.isArray(parsed.priorityDirectives) && parsed.priorityDirectives.length > 0) {
            parsed.priorityDirectives.forEach((dir, i) => {
              if (mitigationDirectives[i]) {
                mitigationDirectives[i].action = dir;
              }
            });
          }
        }
      } catch (err) {
        logger.warn('Gemini risk assessment fallback to deterministic logic:', { error: err.message });
      }
    }

    const assessmentResult = {
      districtId: district.id,
      districtName: district.name,
      state: district.state,
      hazardType,
      riskTier,
      compositeScore,
      subScores,
      keyFindings,
      mitigationDirectives,
      memoryLink: memories.length > 0 ? memories[0] : null,
      activeAlertsCount: alerts.length,
      evaluatedAt: new Date().toISOString()
    };

    // Save assessment to database
    await SupabaseService.saveRiskAssessment(assessmentResult);

    return assessmentResult;
  }
};
