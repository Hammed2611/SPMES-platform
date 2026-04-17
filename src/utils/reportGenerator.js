import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getGradeLetter } from '../data/mockData';

/**
 * Generates and downloads a professional PDF project report.
 * @param {Object} project - The project data
 * @param {Object} student - The student user data
 * @param {Object} lecturer - The lecturer user data
 */
export const downloadProjectPDF = (project, student, lecturer) => {
  const doc = new jsPDF();
  const primaryColor = [15, 23, 42]; // slate-900

  // 1. Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SPMES | ACADEMIC PORTAL', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Project Management & Evaluation System', 20, 32);

  // 2. Document Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Assessment Report', 20, 55);
  
  // Date and Transcript ID
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 140, 55);
  doc.text(`Transcript ID: TR-${project.id.slice(-6).toUpperCase()}`, 140, 60);

  // 3. Information Sections
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, 65, 190, 65);

  // Student & Project Info Table
  const infoData = [
    ['Student Name:', student?.name || 'N/A', 'Matric Number:', student?.matricNumber || 'S-00124'],
    ['Department:', student?.department || 'N/A', 'Category:', project.category || 'N/A'],
    ['Project Title:', { content: project.title, colSpan: 3 }],
    ['Supervisor:', lecturer?.name || 'N/A', 'Session:', project.semester || '2024/2025']
  ];

  doc.autoTable({
    startY: 70,
    body: infoData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      2: { fontStyle: 'bold', cellWidth: 35 }
    }
  });

  // 4. Rubric Breakdown Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Breakdown', 20, doc.lastAutoTable.finalY + 15);

  const rubricRows = [];
  const rubricLabels = {
    innovation: 'Innovation & Creativity',
    technical: 'Technical Execution',
    presentation: 'Presentation & Demo',
    documentation: 'Project Report'
  };

  if (project.rubric) {
    Object.entries(project.rubric).forEach(([key, data]) => {
      rubricRows.push([
        rubricLabels[key] || key,
        `${data.weight}%`,
        `${data.score}/100`,
        data.comment || 'No specific comments provided.'
      ]);
    });
  }

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Assessment Category', 'Weight', 'Score', 'Evaluator Feedback']],
    body: rubricRows,
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 15 },
    }
  });

  // 5. Final Grade Section
  const finalY = doc.lastAutoTable.finalY + 20;
  
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(20, finalY, 170, 40, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, finalY, 170, 40, 'S');

  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FINAL ASSESSMENT SCORE', 35, finalY + 18);
  
  doc.setFontSize(32);
  doc.setFont('helvetica', 'black');
  const score = project.finalScore || 0;
  doc.text(`${score.toFixed(2)}%`, 35, finalY + 32);

  // Grade Badge
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const grade = getGradeLetter(score);
  doc.text(`Grade: ${grade}`, 145, finalY + 22);

  // 6. Footer Signature
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Authorized Academic Transcript • SPMES Digital Certification', 105, 280, { align: 'center' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(140, 260, 190, 260);
  doc.text('Internal Examiner Signature', 165, 265, { align: 'center' });

  // Download
  doc.save(`Result_${student?.name?.replace(/\s+/g, '_')}_${project.id.slice(-4)}.pdf`);
};
