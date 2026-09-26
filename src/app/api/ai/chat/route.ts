import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MOCK_DOCUMENTS, MOCK_LOCATIONS, DEMO_EMPLOYEE } from '@/lib/mock-data';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Grounding context from mock company knowledge base
      const knowledgeContext = MOCK_DOCUMENTS.map(d => `[${d.title}]: ${d.content}`).join('\n\n');
      const locationContext = MOCK_LOCATIONS.map(l =>
        `[${l.name}]: ${l.building}, ${l.floor}, ${l.room || ''}. Contact: ${l.contact_name || ''} (${l.contact_phone || ''})`
      ).join('\n');

      const systemPrompt = `You are Genesis, the intelligent onboarding assistant for Microsoft new joiners.
Current Employee Context:
- Name: ${DEMO_EMPLOYEE.name}
- Role: ${DEMO_EMPLOYEE.role}
- Department: Engineering (Noida Campus, Tower B)
- Onboarding Day: Day 2 of 5
- Work Type: Hybrid

Company Knowledge Base & Policies:
${knowledgeContext}

Campus Locations & Contacts:
${locationContext}

Guidelines:
1. Be encouraging, concise, and structured.
2. If the user asks about locations or hours, provide exact building, floor, and contact details.
3. If the user reports being blocked, suggest the appropriate contact or IT Help Desk (Tower B, 2nd Floor).
4. Ground your answers strictly in the knowledge provided.`;

      const prompt = `${systemPrompt}\n\nUser Question: ${message}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return NextResponse.json({
        reply: text,
        sources: ['Microsoft India Employee Handbook', 'IT Setup Guide', 'Noida Campus Directory'],
      });
    }

    // Fallback if no API key is set
    return NextResponse.json({
      reply: `I received your question: "${message}". In demo mode without a live GEMINI_API_KEY, I'm ready to guide you through your Day 2 tasks: Collect your Surface Pro from IT Help Desk (Tower B, 2nd Floor) and configure your corporate account!`,
      sources: ['Demo Knowledge Engine'],
    });
  } catch (error: unknown) {
    console.error('Gemini API chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal AI service error' },
      { status: 500 }
    );
  }
}
