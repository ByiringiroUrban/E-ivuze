export const safeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const buildRow = (cells) => {
  return `<Row>${cells
    .map((cell) => `<Cell><Data ss:Type="String">${safeText(cell)}</Data></Cell>`)
    .join('')}</Row>`;
};

export const downloadExcelXml = ({
  fileName = `export_${new Date().toISOString().slice(0, 10)}.xls`,
  sheets = []
} = {}) => {
  const workbookOpen =
    '<?xml version="1.0"?>' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';

  const workbookClose = '</Workbook>';

  const worksheets = sheets
    .map((sheet) => {
      const name = safeText(sheet?.name || 'Sheet1');
      const columns = Array.isArray(sheet?.columns) ? sheet.columns : [];
      const rows = Array.isArray(sheet?.rows) ? sheet.rows : [];

      const headerRow = columns.length ? buildRow(columns) : '';
      const bodyRows = rows
        .map((row) => buildRow(columns.map((col) => (row && row[col] !== undefined ? row[col] : row?.[col] ?? ''))))
        .join('');

      return (
        `<Worksheet ss:Name="${name}">` +
        '<Table>' +
        headerRow +
        bodyRows +
        '</Table>' +
        '</Worksheet>'
      );
    })
    .join('');

  const xls = workbookOpen + worksheets + workbookClose;
  const blob = new Blob([xls], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const printHtmlToPdf = ({ title = 'Report', html = '' } = {}) => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><title>${safeText(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1,h2,h3 { margin: 0 0 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
      th { background: #f5f5f5; }
      .muted { color: #666; font-size: 12px; }
      .section { margin-top: 18px; }
    </style>
  </head><body>${html}</body></html>`);
  printWindow.document.close();

  // Wait for DOM to render
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    // close after print dialog is opened
    setTimeout(() => {
      printWindow.close();
    }, 300);
  }, 250);
};
