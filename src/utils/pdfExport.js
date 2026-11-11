import { jsPDF } from 'jspdf';

/**
 * Generates an official, highly polished, vector PDF Disaster Preparedness Action Plan
 */
export const exportActionPlanPDF = ({
  districtName = 'District',
  state = 'State',
  hazardType = 'Flood',
  preparednessScore = null,
  riskLevel = 'Moderate Risk',
  immediateTasks = [],
  midTermTasks = [],
  evidenceNotes = '',
  source = 'State Disaster Management Authority'
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 18;

  // Header Banner
  doc.setFillColor(7, 27, 51); // Navy #071B33
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Emblem / System Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RESILIENCE AI — DISASTER PREPAREDNESS ACTION DIRECTIVE', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 220, 240);
  doc.text(`NATIONAL DISASTER PREPAREDNESS INTELLIGENCE SYSTEM | CLASSIFICATION: OFFICIAL USE`, margin, 18);
  doc.text(`GENERATED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | HACKATHON DIRECTIVE 2026`, margin, 23);

  y = 36;

  // Document Summary Block
  doc.setDrawColor(220, 225, 235);
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${districtName.toUpperCase()} DISTRICT — ${hazardType.toUpperCase()} MITIGATION PLAN`, margin + 4, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`State / Jurisdiction: ${state} | Target Threat Hazard: ${hazardType}`, margin + 4, y + 14);

  const scoreText = preparednessScore !== null && preparednessScore !== undefined
    ? `Preparedness Readiness Index: ${preparednessScore}/100 (${riskLevel})`
    : `Preparedness Readiness Index: Insufficient verified data`;
  doc.text(scoreText, margin + 4, y + 20);

  y += 34;

  // Immediate Priority Directives Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28); // Red
  doc.text('1. IMMEDIATE OPERATIONAL DIRECTIVES (T-0 to 48 Hours)', margin, y);
  y += 4;

  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const renderTasks = (tasks, defaultPriority = 'Immediate') => {
    if (!tasks || tasks.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('No operational directives registered for this category.', margin, y);
      y += 8;
      return;
    }

    tasks.forEach((t, idx) => {
      // Check page overflow
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }

      const taskTitle = t.task || t.title || 'Mitigation Action';
      const agency = t.agency || 'District Administration (DDMA)';
      const priority = t.priority || defaultPriority;
      const problem = t.problem || 'Identified Vulnerability';
      const required = t.requiredResources || 'Standard Emergency Stockpiles';
      const evidence = t.supportingEvidence || t.reason || 'Historical disaster audit telemetry';

      doc.setFillColor(250, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 24, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`[${priority.toUpperCase()}] ${idx + 1}. ${taskTitle.substring(0, 85)}`, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Responsible Agency: ${agency} | Problem Addressed: ${problem.substring(0, 60)}`, margin + 3, y + 10);
      doc.text(`Required Resources: ${required.substring(0, 80)}`, margin + 3, y + 15);
      doc.text(`Supporting Evidence / Telemetry: ${evidence.substring(0, 85)}`, margin + 3, y + 20);

      y += 28;
    });
  };

  renderTasks(immediateTasks, 'Immediate');

  y += 4;
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 20;
  }

  // Mid-Term Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 64, 175); // Blue
  doc.text('2. MID-TERM STRUCTURAL & RESILIENCE MEASURES (Post-Monsoon)', margin, y);
  y += 4;

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  renderTasks(midTermTasks, 'Mid-Term');

  // Official Disclaimer & Footer
  if (y > pageHeight - 30) {
    doc.addPage();
    y = 20;
  }

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('STATUTORY DISCLAIMER & SOURCE CITATION:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const disclaimerText = 'This action plan was synthesized by the RESILIENCE AI Disaster Intelligence Engine utilizing verified historical disaster indicators and multi-hazard telemetry. AI recommendations are advisory and designed to support operational planning by certified District Disaster Management Authorities.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - (margin * 2));
  doc.text(splitDisclaimer, margin, y);

  // Save the PDF file
  const fileName = `${districtName.toLowerCase().replace(/\s+/g, '_')}_${hazardType.toLowerCase()}_action_plan.pdf`;
  doc.save(fileName);
  return fileName;
};
