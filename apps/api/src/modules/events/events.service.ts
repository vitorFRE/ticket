import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client";
import {
  EventStatus,
  ExternalSource,
  InventoryMode,
  type UserRole,
} from "../../generated/prisma/enums";
import { CatalogService } from "../catalog/catalog.service";
import type { CatalogSource } from "../catalog/types/catalog-item.type";
import { isCatalogSource } from "../catalog/types/catalog-item.type";
import { PrismaService } from "../prisma/prisma.service";
import { ReservationsService } from "../reservations/reservations.service";
import type { CreateEventDto } from "./dto/create-event.dto";
import type { UpdateEventDto } from "./dto/update-event.dto";
import { InventoryService } from "./inventory.service";

const SOURCE_TO_EXTERNAL: Record<CatalogSource, ExternalSource> = {
  tmdb: ExternalSource.TMDB,
  ticketmaster: ExternalSource.TICKETMASTER,
};

type Viewer = {
  sub: string;
  role: UserRole;
} | null;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
    private readonly inventory: InventoryService,
    private readonly reservations: ReservationsService,
  ) {}

  async listPublished(q?: string) {
    const where: Prisma.EventWhereInput = {
      status: EventStatus.PUBLISHED,
      ...(q ? { title: { contains: q } } : {}),
    };

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { startsAt: "asc" },
      select: this.listSelect(),
    });

    return { items: events };
  }

  async listMine(organizerId: string) {
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      orderBy: { updatedAt: "desc" },
      select: this.listSelect(),
    });
    return { items: events };
  }

  async getById(id: string, viewer: Viewer) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: this.detailSelect(),
    });

    if (!event) {
      throw new NotFoundException("Evento não encontrado");
    }

    this.assertCanView(event, viewer);
    return event;
  }

  async create(organizerId: string, dto: CreateEventDto) {
    if (!isCatalogSource(dto.source)) {
      throw new BadRequestException(
        "source inválido. Use tmdb ou ticketmaster",
      );
    }
    const source = dto.source;

    if (
      dto.inventoryMode === InventoryMode.GA_SECTOR &&
      (!dto.sectors || dto.sectors.length === 0)
    ) {
      throw new BadRequestException(
        "sectors é obrigatório para inventoryMode GA_SECTOR",
      );
    }

    const catalog = await this.catalogService.getDetail(source, dto.externalId);

    const title = dto.title?.trim() || catalog.title;
    const description =
      dto.description !== undefined
        ? dto.description
        : (catalog.description ?? null);
    const imageUrl =
      dto.imageUrl !== undefined ? dto.imageUrl : (catalog.imageUrl ?? null);
    const venue = (dto.venue?.trim() || catalog.venue || "").trim();
    const startsAtRaw = dto.startsAt || catalog.startsAt;

    if (!venue) {
      throw new BadRequestException(
        "venue é obrigatório (catalog não forneceu local)",
      );
    }
    if (!startsAtRaw) {
      throw new BadRequestException(
        "startsAt é obrigatório (catalog não forneceu data)",
      );
    }

    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException("startsAt inválido");
    }

    const seats =
      dto.inventoryMode === InventoryMode.SEAT_MAP
        ? this.inventory.buildSeats(dto.seatMap)
        : [];
    const sectors =
      dto.inventoryMode === InventoryMode.GA_SECTOR
        ? this.inventory.buildSectors(dto.sectors)
        : [];

    const event = await this.prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          organizerId,
          title,
          description,
          venue,
          startsAt,
          priceCents: dto.priceCents,
          status: EventStatus.DRAFT,
          inventoryMode: dto.inventoryMode,
          externalSource: SOURCE_TO_EXTERNAL[source],
          externalId: dto.externalId,
          externalPayload: catalog.raw as Prisma.InputJsonValue,
          imageUrl,
          ...(seats.length
            ? {
                seats: {
                  createMany: { data: seats },
                },
              }
            : {}),
          ...(sectors.length
            ? {
                sectors: {
                  createMany: { data: sectors },
                },
              }
            : {}),
        },
        select: this.detailSelect(),
      });
      return created;
    });

    return event;
  }

  async update(id: string, organizerId: string, dto: UpdateEventDto) {
    const event = await this.requireOwnedDraft(id, organizerId);

    const startsAt =
      dto.startsAt !== undefined ? new Date(dto.startsAt) : undefined;
    if (startsAt !== undefined && Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException("startsAt inválido");
    }

    return this.prisma.event.update({
      where: { id: event.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.venue !== undefined ? { venue: dto.venue.trim() } : {}),
        ...(startsAt !== undefined ? { startsAt } : {}),
        ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      },
      select: this.detailSelect(),
    });
  }

  async publish(id: string, organizerId: string) {
    const event = await this.requireOwnedDraft(id, organizerId);

    const inventoryCount =
      event.inventoryMode === InventoryMode.SEAT_MAP
        ? await this.prisma.seat.count({ where: { eventId: id } })
        : await this.prisma.sector.count({ where: { eventId: id } });

    if (inventoryCount < 1) {
      throw new BadRequestException(
        "Evento sem inventário não pode ser publicado",
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.PUBLISHED },
      select: this.detailSelect(),
    });
  }

  async listSeats(eventId: string, viewer: Viewer) {
    await this.reservations.expireOverdueReservations();
    const event = await this.requireViewableEvent(eventId, viewer);
    if (event.inventoryMode !== InventoryMode.SEAT_MAP) {
      throw new BadRequestException("Evento não usa mapa de assentos");
    }

    const seats = await this.prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ row: "asc" }, { number: "asc" }],
      select: {
        id: true,
        label: true,
        row: true,
        number: true,
        status: true,
      },
    });

    return { eventId, items: seats };
  }

  async listSectors(eventId: string, viewer: Viewer) {
    await this.reservations.expireOverdueReservations();
    const event = await this.requireViewableEvent(eventId, viewer);
    if (event.inventoryMode !== InventoryMode.GA_SECTOR) {
      throw new BadRequestException("Evento não usa setores GA");
    }

    const sectors = await this.prisma.sector.findMany({
      where: { eventId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        capacity: true,
        availableCount: true,
        priceCents: true,
      },
    });

    return {
      eventId,
      items: sectors.map((sector) => ({
        ...sector,
        priceCents: sector.priceCents ?? event.priceCents,
      })),
    };
  }

  private async requireOwnedDraft(id: string, organizerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        organizerId: true,
        status: true,
        inventoryMode: true,
      },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new NotFoundException("Evento não encontrado");
    }
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException(
        "Só é possível editar/publicar eventos em DRAFT",
      );
    }
    return event;
  }

  private async requireViewableEvent(eventId: string, viewer: Viewer) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizerId: true,
        status: true,
        inventoryMode: true,
        priceCents: true,
      },
    });

    if (!event) {
      throw new NotFoundException("Evento não encontrado");
    }
    this.assertCanView(event, viewer);
    return event;
  }

  private assertCanView(
    event: { status: EventStatus; organizerId: string },
    viewer: Viewer,
  ) {
    if (event.status === EventStatus.PUBLISHED) {
      return;
    }
    if (viewer && viewer.sub === event.organizerId) {
      return;
    }
    throw new NotFoundException("Evento não encontrado");
  }

  private listSelect() {
    return {
      id: true,
      title: true,
      description: true,
      venue: true,
      startsAt: true,
      priceCents: true,
      status: true,
      inventoryMode: true,
      externalSource: true,
      externalId: true,
      imageUrl: true,
      organizerId: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.EventSelect;
  }

  private detailSelect() {
    return {
      ...this.listSelect(),
      externalPayload: true,
      _count: {
        select: {
          seats: true,
          sectors: true,
        },
      },
    } satisfies Prisma.EventSelect;
  }
}
