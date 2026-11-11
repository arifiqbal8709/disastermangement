import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let genAI = null;
if (config.gemini.apiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    logger.info('Google Generative AI SDK initialized.');
  } catch (err) {
    logger.error('Failed to initialize Google Generative AI:', { error: err.message });
  }
} else {
  logger.warn('GEMINI_API_KEY is not set. Real AI calls will require the API key in backend/.env.');
}

const SYSTEM_INSTRUCTION = `You are a Senior Disaster Intelligence Analyst and Emergency Planning Specialist for the Government Disaster Management Authority.
Your job is to analyze real post-disaster reports, situation logs, hazard audits, and DDMP (District Disaster Management Plan) documents.

RULES:
1. Extract factual intelligence strictly from the provided text.
2. DO NOT invent or fabricate statistics, death tolls, or dates.
3. If specific information (e.g. shelter capacities, rainfall mm) is missing from the document, explicitly record it in "missing_information".
4. Separate verified empirical facts from analytical recommendations.
5. Provide actionable, high-priority recommendations with suggested responsible departments (e.g. DDMA, PWD, Health, SDRF).
6. Always return ONLY a single, valid JSON object matching the exact schema requested. Do not include markdown code fence formatting like \`\`\`json.`;

export const GeminiService = {
  /**
   * Analyze an extracted disaster document text and compare with relevant historical context
   */
  analyzeDisasterReport: async (documentText, historicalContext = [], metadata = {}) => {
    if (!genAI || !config.gemini.apiKey) {
      logger.warn('Gemini API key missing. Returning structured fallback indicating API key requirement.');
      return {
        isRealAi: false,
        summary: `Document analysis queued. Note: Configure GEMINI_API_KEY in backend/.env to execute live Gemini 1.5 Flash inference.`,
        disaster_type: metadata.hazard || 'Disaster Assessment',
        location: {
          district: metadata.district || 'Unassigned',
          state: metadata.state || 'India'
        },
        findings: [
          {
            finding: 'Document registered into intelligence repository.',
            evidence: `File: ${metadata.fileName || 'Uploaded PDF'}, Size: ${metadata.fileSize || 'Standard'} bytes.`,
            confidence: 100,
            document: metadata.fileName || 'Official Record',
            reference: 'System Ingestion'
          }
        ],
        risk_factors: [
          'Live AI extraction requires GEMINI_API_KEY in backend configuration.'
        ],
        resource_gaps: [],
        recommendations: [
          {
            action: 'Configure GEMINI_API_KEY to activate multi-parameter Gemini Flash analysis.',
            priority: 'High',
            agency: 'System Administrator'
          }
        ],
        missing_information: [
          'Full automated semantic entity extraction requires Gemini API key.'
        ],
        historical_comparison: {
          matched_incidents: historicalContext.map(h => h.name || h.title),
          similarity_note: 'Awaiting Gemini comparison synthesis.'
        },
        disclaimer: 'DISCLAIMER: AI-generated assessments are advisory analytical tools and must not be treated as official statutory government directives without executive DDMA verification.'
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: config.gemini.model || 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const historySummary = historicalContext.length > 0 
        ? JSON.stringify(historicalContext.map(h => ({
            name: h.name,
            year: h.incident_year,
            type: h.disaster_type,
            impact: h.impact_summary,
            source: h.source_name
          })))
        : 'No specific prior incidents found in local registry.';

      const prompt = `
${SYSTEM_INSTRUCTION}

ANALYZE THE FOLLOWING OFFICIAL DISASTER DOCUMENT:
Document Title / Context: ${metadata.docTitle || metadata.fileName || 'Disaster Report'}
Authority: ${metadata.authority || 'State Disaster Management Authority'}

DOCUMENT TEXT:
${documentText}

HISTORICAL DISASTER RECORDS FOR REGIONAL COMPARISON:
${historySummary}

RETURN A VALID JSON OBJECT WITH THE EXACT FOLLOWING SCHEMA:
{
  "summary": "Concise 2-3 sentence executive summary of the incident/report",
  "disaster_type": "Flood | Cyclone | Landslide | Earthquake | Heatwave | Multi-Hazard",
  "location": {
    "district": "Identified District Name or null",
    "state": "Identified State Name or null"
  },
  "findings": [
    {
      "finding": "Specific empirical finding or incident reality",
      "evidence": "Direct quote or data citation from document",
      "confidence": 90,
      "document": "${metadata.docTitle || metadata.fileName || 'Official Document'}",
      "reference": "Section or context from document",
      "gap": "Underlying institutional or infrastructure deficit",
      "action": "Immediate corrective recommendation"
    }
  ],
  "risk_factors": [
    "Key vulnerability or environmental risk factor extracted from text"
  ],
  "resource_gaps": [
    {
      "resource": "Specific resource needed (e.g. Inflatable rescue boats, De-watering pumps, Slope tilt sensors)",
      "identified_need": "Quantity or description needed",
      "current_status": "Current deficit noted in document"
    }
  ],
  "recommendations": [
    {
      "action": "Evidence-based mitigation directive",
      "priority": "Immediate | High | Medium",
      "agency": "Responsible department (e.g. DDMA, PWD, Health, SDRF)",
      "reason": "Why this action is needed based on findings"
    }
  ],
  "missing_information": [
    "Key disaster management telemetry or details absent from the report"
  ],
  "historical_comparison": {
    "comparable_incident": "Name of closest historical event if applicable, or null",
    "similarity_points": ["Point of operational similarity to historical memory"],
    "recurrence_risk": "High | Moderate | Low based on historical memory"
  }
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Clean any accidental markdown backticks
      let cleanJson = text;
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanJson);

      return {
        isRealAi: true,
        ...parsed,
        disclaimer: 'DISCLAIMER: AI-generated assessments are advisory analytical tools and must not be treated as official statutory government directives without executive DDMA verification.'
      };
    } catch (err) {
      logger.error('Gemini AI analysis error:', { error: err.message });
      throw new Error(`AI Analysis failed: ${err.message}`);
    }
  }
};

