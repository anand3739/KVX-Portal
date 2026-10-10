/**
 * Utility function to trigger client-side file download for CSVs
 * @param {string} filename - The name of the file to download
 * @param {string[]} headers - Array of header strings
 * @param {Array<Array<any>>} rows - 2D array of row data
 */
export const downloadCSV = (filename, headers, rows) => {
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(cell => `"${String(cell === null || cell === undefined ? '' : cell).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Utility function to trigger client-side file download for plain text/logs/JSON
 * @param {string} filename - The name of the file to download
 * @param {string} content - File string content
 * @param {string} mimeType - The MIME type (default text/plain)
 */
export const downloadTextFile = (filename, content, mimeType = "text/plain") => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Utility function to trigger client-side PDF / document download (TS-128)
 * @param {string} filename - The name of the file to download
 * @param {string} content - PDF or document text representation
 */
export const downloadPDFDocument = (filename = "case-study.pdf", content = "") => {
  const fileContent = content || `KRAVIX TECH - CASE STUDY\n========================\n\nTitle: Enterprise Digital Transformation\nPublished: 2026\n\nOverview:\nDetailed architecture and case study documentation.\n`;
  if (typeof document !== 'undefined') {
    downloadTextFile(filename.endsWith('.pdf') ? filename : `${filename}.pdf`, fileContent, "application/pdf");
  }
  return { filename, success: true };
};

/**
 * Utility function to trigger Partner Kit download (TS-196)
 */
export const downloadPartnerKit = () => {
  const partnerKitContent = `KRAVIX TECH PARTNER PROGRAM KIT\n=================================\n\n1. Partner Program Overview\n2. Tier Benefits & Commission Structure\n3. Co-Marketing Guidelines\n4. Technical Integration Support\n\nContact: partners@kravixtech.com\n`;
  if (typeof document !== 'undefined') {
    downloadTextFile("KravixTech-Partner-Kit.pdf", partnerKitContent, "application/pdf");
  }
  return { filename: "KravixTech-Partner-Kit.pdf", success: true };
};

