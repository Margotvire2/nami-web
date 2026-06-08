"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { type ProConversation } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/nami/EmptyState";
import {
  useCockpitProConversations,
  useProConversationsSocket,
} from "@/hooks/useCockpitProConversations";
import { getSpaceConfig, proInitials, proTimeAgo } from "./proSpaceConfig";
import { CreateSpaceModal } from "./CreateSpaceModal";
import { NewDmModal } from "./NewDmModal";
import { CockpitProConversationView } from "./CockpitProConversationView";

function getConvName(conv: ProConversation, userId?: string): string {
  if (conv.name) return conv.name;
  const other = conv.members.find((m) => m.id !== userId);
  return other ? `${other.firstName} ${other.lastName}` : "Conversation";
}

export function CockpitProConversationsTab({
  activeConvId,
  onSelectConv,
}: {
  activeConvId: string | null;
  onSelectConv: (id: string | null) => void;
}) {
  const { user } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [newDmOpen, setNewDmOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const { data: conversations, isLoading: loadingConvs } =
    useCockpitProConversations();
  useProConversationsSocket(activeConvId);

  // Auto-select first conversation si aucune sélectionnée
  useEffect(() => {
    if (!activeConvId && conversations?.length) {
      onSelectConv(conversations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, activeConvId]);

  const convList = conversations ?? [];
  const spaces = convList.filter((c) => c.type !== "DIRECT");
  const directs = convList.filter((c) => c.type === "DIRECT");
  const activeConv = convList.find((c) => c.id === activeConvId);

  const filteredSpaces = spaces.filter(
    (c) =>
      !sidebarSearch ||
      getConvName(c, user?.id)
        .toLowerCase()
        .includes(sidebarSearch.toLowerCase()),
  );
  const filteredDirects = directs.filter(
    (c) =>
      !sidebarSearch ||
      getConvName(c, user?.id)
        .toLowerCase()
        .includes(sidebarSearch.toLowerCase()),
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar gauche */}
      <div className="w-[280px] shrink-0 bg-card border-r flex flex-col overflow-hidden">
        <div className="px-4 h-12 flex items-center justify-between shrink-0 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-primary" />
            <span className="text-sm font-semibold">Réseau pro</span>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            aria-label="Créer un espace"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Rechercher…"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loadingConvs ? (
            <div className="space-y-1 px-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : convList.length === 0 ? (
            <div className="px-3 py-6">
              <EmptyState
                icon={Users}
                title="Pas encore de réseau"
                description="Envoyez un message direct ou créez un espace de coordination."
                action={{
                  label: "Nouveau message",
                  onClick: () => setNewDmOpen(true),
                }}
                secondaryAction={{
                  label: "Créer un espace",
                  onClick: () => setCreateOpen(true),
                }}
                variant="subtle"
              />
            </div>
          ) : (
            <>
              {filteredSpaces.length > 0 && (
                <SidebarSection
                  title="Mes espaces"
                  onAdd={() => setCreateOpen(true)}
                >
                  {filteredSpaces.map((c) => {
                    const cfg = getSpaceConfig(c.type);
                    const Icon = cfg.icon;
                    return (
                      <ConvItem
                        key={c.id}
                        label={getConvName(c, user?.id)}
                        icon={<Icon size={13} className={cfg.color} />}
                        unread={c.unreadCount}
                        active={activeConvId === c.id}
                        lastTime={c.lastMessage?.createdAt}
                        onClick={() => onSelectConv(c.id)}
                      />
                    );
                  })}
                </SidebarSection>
              )}

              <SidebarSection
                title="Messages directs"
                onAdd={() => setNewDmOpen(true)}
              >
                {filteredDirects.map((c) => {
                  const other = c.members.find((m) => m.id !== user?.id);
                  return (
                    <ConvItem
                      key={c.id}
                      label={
                        other ? `${other.firstName} ${other.lastName}` : "DM"
                      }
                      avatar={
                        other ? proInitials(other.firstName, other.lastName) : "?"
                      }
                      unread={c.unreadCount}
                      active={activeConvId === c.id}
                      lastTime={c.lastMessage?.createdAt}
                      onClick={() => onSelectConv(c.id)}
                    />
                  );
                })}
                {filteredDirects.length === 0 && !sidebarSearch && (
                  <p className="text-[10px] text-muted-foreground px-3 py-2">
                    Aucun message direct
                  </p>
                )}
              </SidebarSection>
            </>
          )}
        </div>
      </div>

      {/* Zone conversation */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card">
        {activeConv ? (
          <CockpitProConversationView conversation={activeConv} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare
                size={28}
                className="text-muted-foreground/20 mx-auto mb-3"
              />
              <p className="text-sm text-muted-foreground font-medium">
                Sélectionnez une conversation
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                ou créez-en une nouvelle
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateSpaceModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => onSelectConv(id)}
      />
      <NewDmModal
        open={newDmOpen}
        onOpenChange={setNewDmOpen}
        onCreated={(id) => onSelectConv(id)}
      />
    </div>
  );
}

function SidebarSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {onAdd && (
          <button
            onClick={onAdd}
            aria-label={`Ajouter dans ${title}`}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus size={11} />
          </button>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ConvItem({
  label,
  icon,
  avatar,
  unread,
  active,
  lastTime,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  avatar?: string;
  unread: number;
  active: boolean;
  lastTime?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : unread > 0
            ? "text-foreground font-medium hover:bg-muted/50"
            : "text-muted-foreground hover:bg-muted/50",
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {avatar && !icon && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          {avatar}
        </div>
      )}
      <span className="truncate flex-1">{label}</span>
      {lastTime && !active && (
        <span className="text-[9px] text-muted-foreground/60 shrink-0">
          {proTimeAgo(lastTime)}
        </span>
      )}
      {unread > 0 && !active && (
        <span className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center shrink-0">
          {unread}
        </span>
      )}
    </button>
  );
}
