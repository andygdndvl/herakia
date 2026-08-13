import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const data: { read?: boolean; processed?: boolean } = {};
  if (typeof body.read === 'boolean') data.read = body.read;
  if (typeof body.processed === 'boolean') data.processed = body.processed;
  if (Object.keys(data).length === 0) data.read = true;

  try {
    const submission = await prisma.contactSubmission.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ ok: true, read: submission.read, processed: submission.processed });
  } catch {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }
}