/**
 * Popula eventos demo via catalog APIs reais (API local precisa estar rodando).
 * Uso: node apps/api/scripts/populate-demo-events.mjs
 */
const API = process.env.API_URL ?? "http://localhost:3001";

async function json(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message ?? res.statusText;
    throw new Error(`${res.status} ${Array.isArray(msg) ? msg.join(", ") : msg}`);
  }
  return body;
}

async function main() {
  const login = await json(
    await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "organizer@ticket.local",
        password: "Password123!",
      }),
    }),
  );

  const headers = {
    Authorization: `Bearer ${login.accessToken}`,
    "Content-Type": "application/json",
  };

  const tmdbSearch = await json(
    await fetch(`${API}/catalog/tmdb/search?q=${encodeURIComponent("dune")}`, {
      headers,
    }),
  );
  const tmdbSearch2 = await json(
    await fetch(
      `${API}/catalog/tmdb/search?q=${encodeURIComponent("interstellar")}`,
      { headers },
    ),
  );
  const tmdbSearch3 = await json(
    await fetch(
      `${API}/catalog/tmdb/search?q=${encodeURIComponent("oppenheimer")}`,
      { headers },
    ),
  );
  const tmSearch = await json(
    await fetch(
      `${API}/catalog/ticketmaster/search?q=${encodeURIComponent("concert")}`,
      { headers },
    ),
  );

  const pickMovie = (items) =>
    items.find((i) => String(i.externalId).startsWith("movie:") && i.imageUrl) ??
    items.find((i) => i.imageUrl) ??
    items[0];

  const movies = [
    pickMovie(tmdbSearch.items ?? []),
    pickMovie(tmdbSearch2.items ?? []),
    pickMovie(tmdbSearch3.items ?? []),
  ].filter(Boolean);

  const shows = (tmSearch.items ?? [])
    .filter((i) => i.imageUrl || i.venue)
    .slice(0, 2);

  const venues = [
    "Cinemark Shopping Vila Olímpia",
    "UCI Anália Franco",
    "Kinoplex Bourbon",
  ];
  const starts = [
    "2026-09-12T21:00:00.000Z",
    "2026-09-18T19:30:00.000Z",
    "2026-09-25T22:00:00.000Z",
  ];

  const created = [];

  for (let i = 0; i < movies.length; i++) {
    const item = movies[i];
    const event = await json(
      await fetch(`${API}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          source: "tmdb",
          externalId: item.externalId,
          venue: venues[i] ?? "Cinema Centro",
          startsAt: starts[i] ?? "2026-10-01T20:00:00.000Z",
          priceCents: 3200 + i * 500,
          inventoryMode: "SEAT_MAP",
          seatMap: { rows: ["A", "B", "C", "D"], seatsPerRow: 8 },
        }),
      }),
    );
    await json(
      await fetch(`${API}/events/${event.id}/publish`, {
        method: "POST",
        headers,
      }),
    );
    created.push({ id: event.id, title: event.title, source: "tmdb" });
  }

  for (let i = 0; i < shows.length; i++) {
    const item = shows[i];
    const body = {
      source: "ticketmaster",
      externalId: item.externalId,
      priceCents: 9000 + i * 2000,
      inventoryMode: "GA_SECTOR",
      sectors: [
        { name: "Pista", capacity: 120 },
        { name: "Camarote", capacity: 30, priceCents: 18000 },
      ],
    };
    if (!item.venue) body.venue = "Allianz Parque";
    if (!item.startsAt) body.startsAt = "2026-11-08T21:00:00.000Z";

    const event = await json(
      await fetch(`${API}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
    );
    await json(
      await fetch(`${API}/events/${event.id}/publish`, {
        method: "POST",
        headers,
      }),
    );
    created.push({ id: event.id, title: event.title, source: "ticketmaster" });
  }

  // Refresh seed Fight Club poster via catalog if possible
  try {
    const fight = await json(
      await fetch(`${API}/catalog/tmdb/movie%3A550`, { headers }),
    );
    if (fight.imageUrl) {
      // leave existing seed; just log poster for reference
      console.log("Fight Club poster:", fight.imageUrl);
    }
  } catch {
    // ignore
  }

  console.log(`Created ${created.length} published events:`);
  for (const row of created) {
    console.log(`  [${row.source}] ${row.title} (${row.id})`);
  }

  const list = await json(await fetch(`${API}/events`));
  console.log(`Public list now has ${list.items?.length ?? 0} events`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
