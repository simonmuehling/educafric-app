let jsPDFModule: typeof import('jspdf') | null = null;
let xlsxModule: typeof import('xlsx') | null = null;
let html2canvasModule: typeof import('html2canvas') | null = null;

export async function getJsPDF() {
  if (!jsPDFModule) {
    jsPDFModule = await import('jspdf');
  }
  return jsPDFModule.default;
}

export async function getXLSX() {
  if (!xlsxModule) {
    xlsxModule = await import('xlsx');
  }
  return xlsxModule;
}

export async function getHtml2Canvas() {
  if (!html2canvasModule) {
    html2canvasModule = await import('html2canvas');
  }
  return html2canvasModule.default;
}
