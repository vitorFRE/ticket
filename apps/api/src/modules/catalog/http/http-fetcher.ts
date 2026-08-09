import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpFetcher {
  fetch(input: string | URL, init?: RequestInit): Promise<Response> {
    return fetch(input, init);
  }
}
