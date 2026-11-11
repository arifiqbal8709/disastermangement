import { SupabaseService } from './supabaseService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let genAI = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
}

export const SimulatorService = {
  /**
   * Run What-If Disaster Scenario Simulation
   * Computes deterministic hydrological/logistical exposure estimates and
   * generates evidence-based operational directives.
   */
  runScenario: async ({
    districtId,
    disasterType = 'Flood',
    rainfallSurgePct = 25,
    damDischargeCumec = 1200,
    embankmentBreach = false,
    durationHours = 24
  }) => {
    const district = await SupabaseService.getDistrictById(districtId);
    if (!district) {
      throw new Error(`District '${districtId}' not found in database.`);
    }

    const shelters = await SupabaseService.getShelters(district.name);
    const totalShelterCapacity = shelters.reduce((acc, s) => acc + (parseInt(s.capacity) || 400), 0) || 3500;

    // Baseline physical values based on geography
    const basePopulation = 450000; // Average district exposure base
    const baseAreaSqKm = 2400;

    // Simulation multiplier algorithms (Hydrological estimation model)
    const rainFactor = 1 + (rainfallSurgePct / 100);
    const damFactor = damDischargeCumec > 0 ? (damDischargeCumec / 1000) * 0.35 : 0;
    const breachMultiplier = embankmentBreach ? 1.75 : 1.0;

    const projectedFloodDepthMeters = parseFloat((1.2 * rainFactor + damFactor * breachMultiplier).toFixed(2));
    const projectedAreaSubmergedSqkm = parseFloat((Math.min(baseAreaSqKm * 0.45, (85 * rainFactor * breachMultiplier + (damDischargeCumec * 0.04)))).toFixed(1));
    const estimatedPopulationAtRisk = Math.round(Math.min(basePopulation * 0.4, (12000 * rainFactor * breachMultiplier + damDischargeCumec * 6)));
    
    // Shelter occupancy forecast
    const evacueesExpected = Math.round(estimatedPopulationAtRisk * 0.32);
    const shelterDemandPct = parseFloat(((evacueesExpected / Math.max(totalShelterCapacity, 1000)) * 100).toFixed(1));

    // Logistics deployment requirements (NDRF / SDRF standard relief norms)
    const requiredNdrfTeams = Math.max(2, Math.ceil(evacueesExpected / 3500));
    const requiredRescueBoats = Math.max(4, Math.ceil(evacueesExpected / 320));
    const requiredReliefKits = evacueesExpected;
    const drinkingWaterTankers = Math.ceil(evacueesExpected / 1200);

    // Identify critical infrastructure risks
    const infrastructureRisks = [
      `${district.vulnerable_routes || 'Arterial bridge corridors'} (High inundation likelihood)`,
      `Power sub-stations located in low plinth basins (Potential 48h blackout)`,
      `Drinking water treatment filtration units (Turbidity overload)`
    ];
    if (embankmentBreach) {
      infrastructureRisks.unshift(`Primary earthen dyke breach: Rapid 0.8m/hr water ingress in downstream agricultural blocks`);
    }

    // Generate AI Operational Directive
    let aiSimulationSummary = `Scenario model projected: ${rainfallSurgePct}% monsoon rainfall surge with ${damDischargeCumec} cumecs reservoir discharge across ${district.name}. Evacuation demand estimated at ${evacueesExpected.toLocaleString('en-IN')} citizens across ${shelters.length} mapped emergency shelters. Pre-position minimum ${requiredNdrfTeams} NDRF motorized search squads and ${requiredRescueBoats} inflatable craft.`;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a Senior Disaster Management Intelligence Officer at NDMA India.
Analyze this What-If Disaster Simulation data and produce a concise 3-bullet operational preparedness directive:
- District: ${district.name}, State: ${district.state}
- Hazard: ${disasterType}
- Rainfall Surge: +${rainfallSurgePct}% over normal
- Reservoir Spillway Release: ${damDischargeCumec} cumec
- Embankment Integrity: ${embankmentBreach ? 'BREACH DETECTED' : 'Intact but High Hydrostatic Pressure'}
- Forecast Flood Depth: ${projectedFloodDepthMeters} meters
- Population at Risk: ${estimatedPopulationAtRisk} persons
- Shelter Capacity Demand: ${shelterDemandPct}% of verified capacity (${totalShelterCapacity} beds)
- Required NDRF Teams: ${requiredNdrfTeams}

Provide actionable, evidence-based recommendations. Emphasize life safety and route clearance. Keep output under 140 words.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.trim().length > 20) {
          aiSimulationSummary = text.trim();
        }
      } catch (err) {
        logger.warn('Gemini simulator prompt fallback to deterministic summary:', { error: err.message });
      }
    }

    const scenarioResult = {
      districtId: district.id,
      districtName: district.name,
      state: district.state,
      disasterType,
      parameters: {
        rainfallSurgePct,
        damDischargeCumec,
        embankmentBreach,
        durationHours
      },
      impacts: {
        projectedFloodDepthMeters,
        projectedAreaSubmergedSqkm,
        estimatedPopulationAtRisk,
        evacueesExpected,
        shelterDemandPct,
        shelterCapacityAvailable: totalShelterCapacity,
        sheltersCount: shelters.length,
        isShelterDeficit: shelterDemandPct > 100
      },
      logistics: {
        requiredNdrfTeams,
        requiredRescueBoats,
        requiredReliefKits,
        drinkingWaterTankers
      },
      infrastructureRisks,
      aiSimulationSummary,
      timestamp: new Date().toISOString()
    };

    // Save to scenario database table
    await SupabaseService.saveScenario(scenarioResult);

    return scenarioResult;
  }
};
