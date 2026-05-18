import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured in .env' }, { status: 500 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const systemInstruction = `Anda adalah AI Outdoor Equipment Recommendation Assistant untuk aplikasi peminjaman alat gunung dan outdoor.

Tugas Anda adalah membantu pengguna menemukan perlengkapan yang paling sesuai berdasarkan aktivitas, durasi, kondisi cuaca, dan pengalaman pengguna.

Berikan rekomendasi alat yang relevan, realistis, dan berguna untuk aktivitas outdoor.

Instruksi:
Pahami kebutuhan pengguna dari bahasa natural.
Rekomendasikan perlengkapan outdoor yang sesuai.
Berikan alasan singkat dan jelas untuk setiap rekomendasi.
Fokus pada alat gunung/outdoor seperti:
carrier, tenda, sleeping bag, matras, trekking pole, headlamp, nesting, jaket waterproof, cooking set, hammock, flysheet, dll.
Jangan memberikan jawaban terlalu panjang.
Gunakan gaya bahasa yang ramah, modern, dan mudah dipahami.
Jika pengguna pemula, prioritaskan alat yang mudah digunakan.
Jika cuaca hujan/dingin, prioritaskan perlengkapan proteksi/cuaca.
Jika aktivitas lebih ekstrem, rekomendasikan perlengkapan tambahan yang relevan.

PENTING: Output HARUS berupa JSON yang valid dengan format berikut, TANPA teks tambahan di luar JSON. DILARANG KERAS MENGGUNAKAN EMOJI APAPUN DALAM OUTPUT JSON.
{
"trip_type": "",
"difficulty": "",
"weather": "",
"recommendations": [
{
"name": "",
"category": "",
"reason": ""
}
],
"tips": ""
}`;

    const fullPrompt = `${systemInstruction}\n\nUser input: "${prompt}"\n\nReturn JSON only.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown code block formatting if present
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/\`\`\`/g, '').trim();
    }

    try {
      const jsonResponse = JSON.parse(text);
      return NextResponse.json(jsonResponse);
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini:', text);
      return NextResponse.json({ error: 'Failed to parse recommendation from AI. The AI response was not valid JSON.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
