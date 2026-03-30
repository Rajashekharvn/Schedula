import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/availability
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json(availability);
}

// PUT /api/availability — replace entire schedule
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { schedule } = body; // Array of { dayOfWeek, startTime, endTime, isActive }

  if (!Array.isArray(schedule)) {
    return NextResponse.json({ error: "schedule must be an array" }, { status: 400 });
  }

  // Delete existing and recreate
  await prisma.availability.deleteMany({ where: { userId: session.user.id } });
  const created = await prisma.availability.createMany({
    data: schedule.map((s: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }) => ({
      userId: session.user.id!,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isActive: s.isActive ?? true,
    })),
  });

  return NextResponse.json({ count: created.count });
}
