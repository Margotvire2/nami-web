import {
  Network,
  MapPin,
  Building2,
  Home,
  GraduationCap,
  Users,
  MessageCircle,
  Hash,
  Lock,
} from "lucide-react";

type IconType = typeof Network;

export const SPACE_CONFIG: Record<
  string,
  { icon: IconType; color: string; bgColor: string }
> = {
  CLINICAL_NETWORK: { icon: Network, color: "text-teal-600", bgColor: "bg-teal-50" },
  CPTS: { icon: MapPin, color: "text-blue-600", bgColor: "bg-blue-50" },
  HOSPITAL: { icon: Building2, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  PRACTICE: { icon: Home, color: "text-purple-600", bgColor: "bg-purple-50" },
  ALUMNI: { icon: GraduationCap, color: "text-amber-600", bgColor: "bg-amber-50" },
  COMMUNITY: { icon: Users, color: "text-pink-600", bgColor: "bg-pink-50" },
  GROUP: { icon: Lock, color: "text-muted-foreground", bgColor: "bg-muted/30" },
  CHANNEL: { icon: Hash, color: "text-muted-foreground", bgColor: "bg-muted/30" },
  DIRECT: { icon: MessageCircle, color: "text-muted-foreground", bgColor: "bg-muted/30" },
};

export function getSpaceConfig(type: string) {
  return SPACE_CONFIG[type] ?? SPACE_CONFIG.GROUP;
}

export function proInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function proTimeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "maintenant";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  return `${days}j`;
}
