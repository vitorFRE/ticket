import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserRole } from "../../generated/prisma/enums";
import type { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe("AuthService.refreshTokens", () => {
  const usersService = {
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const configService = {
    getOrThrow: (key: string) => {
      if (key === "jwt.accessExpiresIn") return "15m";
      if (key === "jwt.refreshExpiresIn") return "7d";
      if (key === "jwt.accessSecret") return "access-secret";
      if (key === "jwt.refreshSecret") return "refresh-secret";
      throw new Error(`unexpected config key ${key}`);
    },
  };

  let service: AuthService;

  const activeUser = {
    id: "user-1",
    email: "client1@ticket.local",
    role: UserRole.CLIENT,
    isActive: true,
    refreshToken: "hashed-refresh",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService.signAsync
      .mockResolvedValueOnce("new-access")
      .mockResolvedValueOnce("new-refresh");
    bcryptMock.compare.mockResolvedValue(true as never);
    bcryptMock.hash.mockResolvedValue("hashed-new-refresh" as never);
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it("issues tokens with the current DB role", async () => {
    usersService.findById.mockResolvedValue({
      ...activeUser,
      role: UserRole.ORGANIZER,
    });

    await expect(
      service.refreshTokens("user-1", "raw-refresh"),
    ).resolves.toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "user-1",
        role: UserRole.ORGANIZER,
      }),
      expect.objectContaining({ secret: "access-secret" }),
    );
  });

  it("rejects inactive accounts and revokes the stored refresh", async () => {
    usersService.findById.mockResolvedValue({
      ...activeUser,
      isActive: false,
    });

    await expect(
      service.refreshTokens("user-1", "raw-refresh"),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
      "user-1",
      null,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it("rejects an invalid refresh before checking isActive", async () => {
    usersService.findById.mockResolvedValue({
      ...activeUser,
      isActive: false,
    });
    bcryptMock.compare.mockResolvedValue(false as never);

    await expect(
      service.refreshTokens("user-1", "wrong-refresh"),
    ).rejects.toThrow("Refresh token inválido");

    expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
  });

  it("rejects when the user has no stored refresh", async () => {
    usersService.findById.mockResolvedValue({
      ...activeUser,
      refreshToken: null,
    });

    await expect(
      service.refreshTokens("user-1", "raw-refresh"),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(bcryptMock.compare).not.toHaveBeenCalled();
  });
});
