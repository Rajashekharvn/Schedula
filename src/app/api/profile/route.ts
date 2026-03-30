import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/profile — get current user's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, username: true, bio: true, timezone: true, image: true, googleRefreshToken: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...user,
    googleConnected: !!user.googleRefreshToken,
    googleRefreshToken: undefined,
  });
}

// PATCH /api/profile — update profile
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, username, bio, timezone } = body;

  // Check username uniqueness
  if (username) {
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, username, bio, timezone },
    select: { id: true, name: true, email: true, username: true, bio: true, timezone: true, image: true },
  });

  return NextResponse.json(updated);
}
