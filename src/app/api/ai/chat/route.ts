import { NextRequest } from 'next/server';
import { POST as handleChat } from '@/app/api/chat/route';

export async function POST(req: NextRequest) {
  return handleChat(req);
}
