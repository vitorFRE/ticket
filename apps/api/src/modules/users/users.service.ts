import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "../../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

type CreateUserData = {
  email: string;
  name?: string;
  password?: string;
  role?: UserRole;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdSafe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserData) {
    const { role: _ignoredRole, ...rest } = data;
    return this.prisma.user.create({
      data: {
        ...rest,
        role: UserRole.CLIENT,
      },
    });
  }

  async updateRefreshToken(userId: string, hashedToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }
}
