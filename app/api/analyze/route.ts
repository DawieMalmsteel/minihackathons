import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { parsePdf } from '@/lib/parsePdf';
import { getSystemPrompt, getUserPrompt } from '@/lib/prompt';
import { analyzeRequestSchema, analysisResponseSchema } from '@/lib/validators';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: 'API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào .env.local' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    const parsedInput = analyzeRequestSchema.safeParse({
      role: formData.get('role'),
      level: formData.get('level') || undefined,
      recruiterRequirements: formData.get('recruiterRequirements') || undefined,
    });

    if (!file || !parsedInput.success) {
      return NextResponse.json({ error: 'Vui lòng cung cấp CV và vị trí ứng tuyển hợp lệ.' }, { status: 400 });
    }

    const { role, level, recruiterRequirements } = parsedInput.data;

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Chỉ hỗ trợ file PDF.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dung lượng file tối đa là 5MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let cvText = '';
    try {
      cvText = await parsePdf(buffer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi đọc file PDF.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (cvText.trim().length < 50) {
      return NextResponse.json({ error: 'CV không đọc được chữ hoặc là dạng ảnh không hỗ trợ.' }, { status: 400 });
    }

    const systemInstruction = getSystemPrompt();
    const userPrompt = getUserPrompt(cvText, role, level, recruiterRequirements);

    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        score: { type: SchemaType.INTEGER, description: 'Overall score from 0 to 100' },
        rubric: {
          type: SchemaType.OBJECT,
          properties: {
            clarity: { type: SchemaType.INTEGER },
            relevance: { type: SchemaType.INTEGER },
            impact: { type: SchemaType.INTEGER },
            ats: { type: SchemaType.INTEGER },
            language: { type: SchemaType.INTEGER },
          },
          required: ['clarity', 'relevance', 'impact', 'ats', 'language']
        },
        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        rewriteSuggestions: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            experience: { type: SchemaType.STRING },
            projects: { type: SchemaType.STRING },
            skills: { type: SchemaType.STRING },
          },
          required: ['summary', 'experience', 'projects', 'skills']
        },
        overallAdvice: { type: SchemaType.STRING }
      },
      required: ['score', 'rubric', 'strengths', 'weaknesses', 'missingKeywords', 'rewriteSuggestions', 'overallAdvice']
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    
    // Parse the JSON string from Gemini
    const jsonResult = JSON.parse(text);

    // Validate with Zod
    const validatedResult = analysisResponseSchema.parse(jsonResult);

    return NextResponse.json(validatedResult);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error
      ? error.message
      : 'Đã xảy ra lỗi trong quá trình phân tích. Vui lòng thử lại sau.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
