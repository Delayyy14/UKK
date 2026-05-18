import { GoogleGenerativeAI } from '@google/generative-ai';


const apiKey = process.env.GEMINI_API_KEY || '';
async function test() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
