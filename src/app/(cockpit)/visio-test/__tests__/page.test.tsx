import { describe, expect, it } from "vitest";

describe("F-VISIO Phase 0 — LiveKit SDK availability", () => {
  it("imports Room and core symbols from livekit-client", async () => {
    const mod = await import("livekit-client");
    expect(mod.Room).toBeDefined();
    expect(mod.RoomEvent).toBeDefined();
    expect(mod.Track).toBeDefined();
    expect(typeof mod.Room).toBe("function");
  });

  it("instantiates a Room with adaptiveStream + dynacast without throwing", async () => {
    const { Room } = await import("livekit-client");
    const room = new Room({ adaptiveStream: true, dynacast: true });
    expect(room).toBeDefined();
    expect(room.state).toBe("disconnected");
    expect(room.remoteParticipants.size).toBe(0);
  });
});
