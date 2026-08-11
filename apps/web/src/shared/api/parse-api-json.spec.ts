import { describe, expect, it } from "vitest";
import { HttpError } from "@/shared/api/http-error";
import { parseApiJson } from "@/shared/api/parse-api-json";

describe("parseApiJson", () => {
  it("returns JSON on success", async () => {
    const res = new Response(JSON.stringify({ id: "1" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    await expect(parseApiJson<{ id: string }>(res)).resolves.toEqual({
      id: "1",
    });
  });

  it("returns undefined on 204", async () => {
    const res = new Response(null, { status: 204 });
    await expect(parseApiJson<undefined>(res)).resolves.toBeUndefined();
  });

  it("throws HttpError with string message", async () => {
    const res = new Response(JSON.stringify({ message: "Assento ocupado" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
    await expect(parseApiJson(res)).rejects.toMatchObject({
      name: "HttpError",
      status: 409,
      message: "Assento ocupado",
    });
  });

  it("joins array messages", async () => {
    const res = new Response(
      JSON.stringify({ message: ["Campo A", "Campo B"] }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
    await expect(parseApiJson(res)).rejects.toBeInstanceOf(HttpError);
    await expect(
      parseApiJson(
        new Response(JSON.stringify({ message: ["Campo A", "Campo B"] }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ).rejects.toMatchObject({ message: "Campo A, Campo B" });
  });

  it("falls back when the body is not JSON", async () => {
    const res = new Response("oops", { status: 500 });
    await expect(parseApiJson(res)).rejects.toMatchObject({
      status: 500,
      message: "Erro 500",
    });
  });
});
