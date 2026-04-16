"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type RecordingAnalysisResult } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type RecordingStatus = "idle" | "recording" | "paused" | "uploading" | "transcribing" | "analyzing" | "done" | "error";

interface RecordingState {
  status: RecordingStatus;
  careCaseId: string | null;
  patientName: string | null;
  seconds: number;
  result: RecordingAnalysisResult | null;
  error: string | null;
}

interface RecordingContextValue extends RecordingState {
  startRecording: (careCaseId: string, patientName: string) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopAndAnalyze: () => void;
  dismiss: () => void;
}

const RecordingContext = createContext<RecordingContextValue | null>(null);

export function useRecording() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error("useRecording must be used within RecordingProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();

  const [state, setState] = useState<RecordingState>({
    status: "idle",
    careCaseId: null,
    patientName: null,
    seconds: 0,
    result: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const careCaseIdRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState((s) => ({ ...s, seconds: s.seconds + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Start ──

  const startRecording = useCallback(async (careCaseId: string, patientName: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Log device info
      const audioTrack = stream.getAudioTracks()[0];
      console.log("[RECORDING] Using device:", audioTrack.label, audioTrack.getSettings());

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Silence detector (cleaned up on stop)
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      let silenceChecks = 0;
      const silenceInterval = setInterval(() => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg < 2) {
          silenceChecks++;
          if (silenceChecks > 5) {
            console.warn("[RECORDING] ⚠️ Silence detected — micro may not be working");
          }
        } else {
          silenceChecks = 0;
        }
      }, 1000);

      // Cleanup silence detector when recording stops
      mediaRecorder.addEventListener("stop", () => {
        clearInterval(silenceInterval);
        audioCtx.close();
      });

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      careCaseIdRef.current = careCaseId;
      setState({
        status: "recording",
        careCaseId,
        patientName,
        seconds: 0,
        result: null,
        error: null,
      });
      startTimer();
    } catch {
      setState((s) => ({ ...s, status: "error", error: "Impossible d'accéder au microphone" }));
    }
  }, [startTimer]);

  // ── Pause / Resume ──

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setState((s) => ({ ...s, status: "paused" }));
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setState((s) => ({ ...s, status: "recording" }));
      startTimer();
    }
  }, [startTimer]);

  // ── Stop + Analyze ──

  const stopAndAnalyze = useCallback(() => {
    const careCaseId = careCaseIdRef.current;
    if (!mediaRecorderRef.current || !careCaseId || !accessToken) return;

    const duration = state.seconds;

    mediaRecorderRef.current.onstop = async () => {
      console.log("[RECORDING] Stop. Chunks:", chunksRef.current.length, "Total:", chunksRef.current.reduce((s, c) => s + c.size, 0), "bytes");
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      console.log("[RECORDING] Blob size:", blob.size, "bytes");
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const api = apiWithToken(accessToken);

      try {
        // Upload + transcribe
        console.log("[RECORDING] Sending blob:", blob.size, "bytes, type:", blob.type, "chunks:", chunksRef.current.length);
        setState((s) => ({ ...s, status: "transcribing" }));
        const uploadResult = await api.recordings.upload(blob, duration);
        console.log("[RECORDING] Upload result:", JSON.stringify(uploadResult).substring(0, 200));

        // Analyze
        setState((s) => ({ ...s, status: "analyzing" }));
        const analysisResult = await api.recordings.analyze({
          transcription: uploadResult.transcription,
          careCaseId,
          consentConfirmed: true,
        });

        setState((s) => ({ ...s, status: "done", result: analysisResult }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur de traitement";
        setState((s) => ({ ...s, status: "error", error: message }));
      }
    };

    mediaRecorderRef.current.stop();
    stopTimer();
    setState((s) => ({ ...s, status: "uploading" }));
  }, [state.seconds, accessToken, stopTimer]);

  // ── Dismiss ──

  const dismiss = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording" || mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    stopTimer();
    careCaseIdRef.current = null;
    setState({
      status: "idle",
      careCaseId: null,
      patientName: null,
      seconds: 0,
      result: null,
      error: null,
    });
  }, [stopTimer]);

  return (
    <RecordingContext.Provider value={{ ...state, startRecording, pauseRecording, resumeRecording, stopAndAnalyze, dismiss }}>
      {children}
    </RecordingContext.Provider>
  );
}
