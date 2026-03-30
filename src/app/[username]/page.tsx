import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { Clock, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true } });
  return { title: user ? `Book with ${user.name}` : "Not found" };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, bio: true, image: true },
  });
  if (!user) notFound();

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { duration: "asc" },
  });

  if (eventTypes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center px-4">
        <div>
          <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">{user.name}</h1>
          <p className="text-slate-500">No event types available right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Host info */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          {user.bio && <p className="text-slate-400 text-sm max-w-xs mx-auto">{user.bio}</p>}
        </div>

        {/* Event types */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-4">Select an event type</p>
          {eventTypes.map((et) => (
            <Link
              key={et.id}
              href={`/${username}/${et.slug}`}
              id={`event-type-${et.slug}`}
              className="flex items-center gap-4 p-5 glass rounded-2xl border border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold group-hover:text-indigo-300 transition-colors">{et.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(et.duration)}</span>
                  {et.location && <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{et.location}</span>}
                </div>
                {et.description && <p className="text-xs text-slate-600 mt-1 truncate">{et.description}</p>}
              </div>
              <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">→</div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-600">Powered by{" "}
            <Link href="/" className="text-indigo-500 hover:text-indigo-400 font-medium">Schedula</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
