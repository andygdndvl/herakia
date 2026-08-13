import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${params.conversationId}/audio`,
    { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Audio not available' }, { status: res.status });
  }

  return new NextResponse(res.body, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=3600' },
  });
}