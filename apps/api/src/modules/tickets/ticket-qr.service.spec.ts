import { ConfigService } from "@nestjs/config";
import { TicketQrService } from "./ticket-qr.service";

describe("TicketQrService", () => {
  const config = {
    get: jest.fn().mockReturnValue("test-hmac-secret"),
  };
  const service = new TicketQrService(config as unknown as ConfigService);

  it("builds and verifies signed payload", () => {
    const data = {
      code: "code-1",
      eventId: "evt-1",
      ticketId: "tkt-1",
    };
    const payload = service.buildPayload(data);
    expect(payload).toContain(".");
    expect(service.verifyPayload(payload)).toEqual(data);
  });

  it("rejects tampered payload", () => {
    const payload = service.buildPayload({
      code: "c",
      eventId: "e",
      ticketId: "t",
    });
    expect(service.verifyPayload(`${payload}x`)).toBeNull();
    expect(service.verifyPayload("bad")).toBeNull();
  });

  it("creates opaque codes and share tokens", () => {
    expect(service.createCode()).toMatch(/^[0-9a-f-]{36}$/i);
    expect(service.createShareToken().length).toBeGreaterThan(20);
  });
});
