"use client";

/**
 * F-VISIO-TELECONSULTATION — Phase 0 POC
 *
 * Page test de jonction d'une room LiveKit (téléconsultation).
 * - Pas de recording (Art. L.1110-12 CSP : pas d'enregistrement sans consentement explicite).
 * - Pas d'intégration Appointment model en V1 (Phase 0 = preuve de concept SDK uniquement).
 * - Lecture seule : si NEXT_PUBLIC_LIVEKIT_URL / NEXT_PUBLIC_LIVEKIT_POC_TOKEN ne sont pas
 *   définis, l'UI affiche un message explicite sans tenter une connexion.
 *
 * Reco doc : docs/VISIO_TELECONSULTATION_RECO_2026_06_04.md
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  type LocalTrackPublication,
} from "livekit-client";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const LIVEKIT_TOKEN = process.env.NEXT_PUBLIC_LIVEKIT_POC_TOKEN ?? "";

export default function VisioTestPage() {
  const [state, setState] = useState<ConnectionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleLeave = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setState("idle");
    setParticipantCount(0);
    setErrorMessage(null);
  }, []);

  const handleJoin = useCallback(async () => {
    if (!LIVEKIT_URL || !LIVEKIT_TOKEN) {
      setErrorMessage(
        "Variables NEXT_PUBLIC_LIVEKIT_URL et NEXT_PUBLIC_LIVEKIT_POC_TOKEN requises pour le POC.",
      );
      setState("error");
      return;
    }
    setState("connecting");
    setErrorMessage(null);
    try {
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.ParticipantConnected, () => {
        setParticipantCount(room.remoteParticipants.size + 1);
      });
      room.on(RoomEvent.ParticipantDisconnected, () => {
        setParticipantCount(room.remoteParticipants.size + 1);
      });
      room.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          _participant: RemoteParticipant,
        ) => {
          if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
            track.attach(remoteVideoRef.current);
          }
        },
      );
      room.on(RoomEvent.LocalTrackPublished, (pub: LocalTrackPublication) => {
        if (pub.track?.kind === Track.Kind.Video && localVideoRef.current) {
          pub.track.attach(localVideoRef.current);
        }
      });

      await room.connect(LIVEKIT_URL, LIVEKIT_TOKEN);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setParticipantCount(room.remoteParticipants.size + 1);
      setState("connected");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setState("error");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        void roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Téléconsultation — test technique
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Phase 0 — POC d&apos;intégration du SDK vidéo. Aucun enregistrement.
          Aucune donnée patient n&apos;est traitée sur cette page.
        </p>
      </header>

      <section
        aria-labelledby="visio-status"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="visio-status"
          className="mb-3 text-sm font-medium text-slate-700"
        >
          État de la session
        </h2>
        <p data-testid="visio-state" className="text-sm text-slate-900">
          {state} — {participantCount} participant(s)
        </p>
        {errorMessage ? (
          <p
            data-testid="visio-error"
            className="mt-2 text-sm text-rose-600"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-900/95 aspect-video overflow-hidden">
          <video
            ref={localVideoRef}
            data-testid="visio-local-video"
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-900/95 aspect-video overflow-hidden">
          <video
            ref={remoteVideoRef}
            data-testid="visio-remote-video"
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-6 flex gap-3">
        <button
          type="button"
          data-testid="visio-join"
          onClick={handleJoin}
          disabled={state === "connecting" || state === "connected"}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Rejoindre la room test
        </button>
        <button
          type="button"
          data-testid="visio-leave"
          onClick={handleLeave}
          disabled={state !== "connected"}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Quitter
        </button>
      </section>

      <footer className="mt-8 text-xs text-slate-500">
        SDK : LiveKit (open-source). Voir doc reco :
        docs/VISIO_TELECONSULTATION_RECO_2026_06_04.md
      </footer>
    </div>
  );
}
