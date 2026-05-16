declare module 'pdf-parse/lib/pdf-parse.js' {
  export interface PdfParseResult {
    text: string;
  }

  const pdfParse: (dataBuffer: Buffer | Uint8Array) => Promise<PdfParseResult>;
  export default pdfParse;
}
