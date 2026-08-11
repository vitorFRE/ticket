import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type TicketQrData = {
  code: string;
  eventId: string;
  ticketId: string;
};

@Injectable()
export class TicketQrService {
  constructor(private readonly config: ConfigService) {}

  createCode(): string {
    return randomUUID();
  }

  createShareToken(): string {
    return randomBytes(32).toString("base64url");
  }

  buildPayload(data: TicketQrData): string {
    const body = Buffer.from(JSON.stringify(data)).toString("base64url");
    const signature = this.sign(body);
    return `${body}.${signature}`;
  }

  verifyPayload(qrPayload: string): TicketQrData | null {
    const [body, signature] = qrPayload.split(".");
    if (!body || !signature) {
      return null;
    }
    const expected = this.sign(body);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
    try {
      return JSON.parse(
        Buffer.from(body, "base64url").toString("utf8"),
      ) as TicketQrData;
    } catch {
      return null;
    }
  }

  private sign(body: string): string {
    const secret =
      this.config.get<string>("ticketHmacSecret") ??
      this.config.get<string>("TICKET_HMAC_SECRET") ??
      "change-me-ticket-hmac";
    return createHmac("sha256", secret).update(body).digest("base64url");
  }
}
