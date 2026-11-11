import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const historicalIncidentSchema = z.object({
  name: z.string().min(3, 'Incident title is required'),
  disaster_type: z.string().min(2, 'Disaster hazard type is required'),
  state: z.string().min(2, 'State name is required'),
  district: z.string().min(2, 'District name is required'),
  incident_year: z.number().int().min(1900).max(new Date().getFullYear()),
  impact_summary: z.string().min(10, 'Impact summary must be detailed'),
  damage_information: z.string().optional(),
  infrastructure_impact: z.string().optional(),
  response_actions: z.string().optional(),
  source_name: z.string().min(2, 'Source agency is required'),
  source_url: z.string().url().optional().or(z.literal(''))
});

export const scoreCalculationSchema = z.object({
  warning: z.number().min(0).max(100),
  shelter: z.number().min(0).max(100),
  evacuation: z.number().min(0).max(100),
  medical: z.number().min(0).max(100)
});
