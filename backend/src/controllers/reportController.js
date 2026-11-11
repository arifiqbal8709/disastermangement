import path from 'path';
import fs from 'fs';
import { ApiResponse } from '../utils/apiResponse.js';
import { PDFService } from '../services/pdfService.js';
import { GeminiService } from '../services/geminiService.js';
import { SupabaseService } from '../services/supabaseService.js';
import { AuditService } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

export const ReportController = {
  uploadAndAnalyze: async (req, res, next) => {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No PDF file uploaded. Please provide a valid disaster report PDF.', 400);
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const fileSize = req.file.size;
      const { district, state, authority, docTitle, publishedYear } = req.body;

      logger.info(`Received PDF upload: ${originalName} (${fileSize} bytes)`);

      // 1. Create Report Record
      const reportRecord = await SupabaseService.createDisasterReport({
        filename: path.basename(filePath),
        original_name: originalName,
        file_size: fileSize,
        file_url: `/uploads/${path.basename(filePath)}`,
        status: 'processing',
        authority: authority || 'Disaster Management Authority',
        published_year: publishedYear || new Date().getFullYear().toString()
      });

      // 2. Extract Text from PDF
      let extracted;
      try {
        extracted = await PDFService.extractText(filePath);
      } catch (extractErr) {
        await SupabaseService.updateDisasterReportStatus(reportRecord.id, 'failed', extractErr.message);
        return ApiResponse.error(res, `Failed to extract text from PDF: ${extractErr.message}`, 422);
      }

      if (extracted.isScanned) {
        logger.warn(`Uploaded document appears to be a scanned image PDF (${extracted.charCount} chars).`);
      }

      // 3. Retrieve Historical Incidents for Regional Context & Comparison
      const historicalContext = await SupabaseService.getHistoricalIncidents({
        district: district || undefined
      });

      // 4. Send Sanitized Text to Gemini AI
      const sanitizedText = PDFService.sanitizeText(extracted.text);
      let aiResult;
      try {
        aiResult = await GeminiService.analyzeDisasterReport(sanitizedText, historicalContext, {
          fileName: originalName,
          docTitle: docTitle || originalName,
          authority: authority || 'State Disaster Management Authority',
          district,
          state,
          fileSize
        });
      } catch (aiErr) {
        await SupabaseService.updateDisasterReportStatus(reportRecord.id, 'failed', aiErr.message);
        return ApiResponse.error(res, `AI Analysis pipeline encountered an error: ${aiErr.message}`, 502);
      }

      // 5. Save Analysis to Database
      const analysisRecord = await SupabaseService.saveReportAnalysis({
        report_id: reportRecord.id,
        district_id: district ? district.toLowerCase().replace(/\s+/g, '_') : null,
        summary: aiResult.summary,
        disaster_type: aiResult.disaster_type || 'Disaster Assessment',
        location_json: aiResult.location || {},
        findings_json: aiResult.findings || [],
        risk_factors_json: aiResult.risk_factors || [],
        resource_gaps_json: aiResult.resource_gaps || [],
        recommendations_json: aiResult.recommendations || [],
        missing_information_json: aiResult.missing_information || [],
        historical_comparison_json: aiResult.historical_comparison || {},
        is_verified: false
      });

      // 6. Update Report Status to Completed
      await SupabaseService.updateDisasterReportStatus(reportRecord.id, 'analyzed');

      // 7. Audit Log
      await AuditService.log({
        userEmail: req.user ? req.user.email : 'public_user',
        action: 'PDF_REPORT_ANALYZED',
        resourceType: 'DISASTER_REPORT',
        resourceId: reportRecord.id,
        ipAddress: req.ip,
        details: {
          originalName,
          pages: extracted.pages,
          disasterType: aiResult.disaster_type,
          isRealAi: aiResult.isRealAi
        }
      });

      return ApiResponse.success(res, {
        report: reportRecord,
        analysis: analysisRecord,
        aiResult
      }, 'Disaster document successfully processed and analyzed by AI.', 201);
    } catch (err) {
      next(err);
    }
  },

  getAllReports: async (req, res, next) => {
    try {
      const analyses = await SupabaseService.getReportAnalyses();
      return ApiResponse.success(res, analyses, 'Retrieved disaster analyses.');
    } catch (err) {
      next(err);
    }
  }
};
