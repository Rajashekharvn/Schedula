import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, username } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  // Check email uniqueness
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  // Generate unique username
  let finalUsername = username?.trim() ? slugify(username) : slugify(name);
  const existingUsername = await prisma.user.findUnique({ where: { username: finalUsername } });
  if (existingUsername) finalUsername = `${finalUsername}-${Date.now().toString(36)}`;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      username: finalUsername,
      timezone: "UTC",
    },
  });

  // Seed default availability (Mon–Fri, 9AM–5PM)
  const defaultDays = [1, 2, 3, 4, 5];
  await prisma.availability.createMany({
    data: defaultDays.map((day) => ({
      userId: user.id,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    })),
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
