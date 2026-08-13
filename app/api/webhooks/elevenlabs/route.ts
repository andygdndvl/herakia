import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma'; // adapte le chemin vers ton client Prisma existant

const WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET ?? '';

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...v] = p.split('=');
      return [k, v.join('=')];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v0;
  if (!timestamp || !signature) return false;

  // Anti-rejeu : refuse si le timestamp a plus de 30 min
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 30 * 60) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  console.log('Webhook reçu');

  const rawBody = await req.text();
  const signature = req.headers.get('elevenlabs-signature');

  if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.type === 'post_call_transcription') {
    const d = event.data;
    await prisma.tiaCall.upsert({
      where: { conversationId: d.conversation_id },
      create: {
        conversationId: d.conversation_id,
        agentId: d.agent_id,
        status: d.status,
        startedAt: d.metadata?.start_time_unix_secs
          ? new Date(d.metadata.start_time_unix_secs * 1000)
          : null,
        durationSecs: d.metadata?.call_duration_secs ?? null,
        callSuccessful: d.analysis?.call_successful ?? null,
        summary: d.analysis?.transcript_summary ?? null,
        transcript: d.transcript ?? [],
      },
      update: {
        status: d.status,
        durationSecs: d.metadata?.call_duration_secs ?? null,
        callSuccessful: d.analysis?.call_successful ?? null,
        summary: d.analysis?.transcript_summary ?? null,
        transcript: d.transcript ?? [],
      },
    });
  }

  return NextResponse.json({ received: true });
}