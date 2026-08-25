import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MateriasPDF = (formData, materiasAcreditadas, folio = 'EN TRÁMITE') => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    // 1. Franja institucional superior
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 216, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BACHILLERATO EN LÍNEA DE VERACRUZ (BELVER)', 14, 11);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Centro de Atención Estudiantil (CAE) • Cédula de Materias para Dictamen de Revalidación', 14, 18);

    // 2. Bloque de Datos del Aspirante
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('I. DATOS DEL ASPIRANTE Y ANTECEDENTES ACADÉMICOS', 14, 34);

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 37, 188, 30, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 18, 44);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.fullName || 'No especificado', 35, 44);

    doc.setFont('helvetica', 'bold');
    doc.text('CURP:', 125, 44);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.curp || 'No especificado', 140, 44);

    doc.setFont('helvetica', 'bold');
    doc.text('Procedencia:', 18, 52);
    doc.setFont('helvetica', 'normal');
    const procedencia = `${formData.previousHighSchoolSystem || ''} - ${formData.previousHighSchoolName || ''}`;
    doc.text(procedencia.substring(0, 80), 42, 52);

    doc.setFont('helvetica', 'bold');
    doc.text('Folio:', 18, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(folio, 30, 60);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 125, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('es-MX'), 140, 60);

    // 3. Tabla de Asignaturas Acreditadas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('II. RELACIÓN DE ASIGNATURAS ACREDITADAS DECLARADAS', 14, 75);

    const tableRows = materiasAcreditadas
      .filter((mat) => mat.materia.trim() !== '')
      .map((mat, index) => [
        index + 1,
        mat.materia.toUpperCase(),
        `${mat.semestre}° Semestre`,
        mat.calificacion ? Number(mat.calificacion).toFixed(1) : 'Pendiente',
        'Acreditada'
      ]);

    if (tableRows.length === 0) {
      tableRows.push(['-', 'Sin materias capturadas', '-', '-', '-']);
    }

    autoTable(doc, {
      startY: 79,
      head: [['#', 'Nombre de la Asignatura', 'Semestre Cursado', 'Calificación', 'Estatus']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 95 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 28 },
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 120;

    // 4. Pie y Firma
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Nota: Esta relación de materias tiene carácter informativo y queda sujeta a cotejo contra la constancia oficial en el CAE.',
      14,
      finalY,
      { maxWidth: 188 }
    );

    doc.setDrawColor(148, 163, 184);
    doc.line(70, finalY + 25, 146, finalY + 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Firma de Conformidad del Aspirante', 108, finalY + 30, { align: 'center' });

    // Guardar archivo
    const safeCurp = (formData.curp || 'Aspirante').toUpperCase();
    doc.save(`Cedula_Materias_${safeCurp}.pdf`);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Ocurrió un detalle al generar el archivo PDF. Revisa la consola del navegador.');
  }
};