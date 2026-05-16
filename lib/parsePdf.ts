type PdfParseFn = (buffer: Buffer) => Promise<{ text: string }>;

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParserModule = (await import('pdf-parse/lib/pdf-parse.js')) as { default: PdfParseFn };
    const data = await pdfParserModule.default(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Không đọc được nội dung PDF. Vui lòng thử file text-based PDF khác.');
  }
}
