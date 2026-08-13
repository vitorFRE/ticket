import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { JwtPayload } from "../../common/types/jwt-payload.type";
import { UserRole } from "../../generated/prisma/enums";
import { UsersService } from "../users/users.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    this.assertRegistrationAllowed();

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException("Email já está em uso");

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      password: hashed,
      role: UserRole.CLIENT,
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...profile
    } = user;
    return { ...tokens, user: profile };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Credenciais inválidas");

    if (!user.isActive) throw new UnauthorizedException("Conta desativada");

    const isValid = await bcrypt.compare(dto.password, user.password ?? "");
    if (!isValid) throw new UnauthorizedException("Credenciais inválidas");

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...profile
    } = user;
    return { ...tokens, user: profile };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, token: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) throw new UnauthorizedException("Refresh token inválido");

    if (!user.isActive) {
      await this.usersService.updateRefreshToken(userId, null);
      throw new UnauthorizedException("Conta desativada");
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...profile
    } = user;
    return profile;
  }

  private assertRegistrationAllowed(): void {
    if (process.env.ALLOW_REGISTRATION === "false") {
      throw new ForbiddenException("Registro desabilitado");
    }
  }

  private async generateTokens(payload: JwtPayload) {
    const accessExpiry = this.configService.getOrThrow<string>(
      "jwt.accessExpiresIn",
    ) as never;
    const refreshExpiry = this.configService.getOrThrow<string>(
      "jwt.refreshExpiresIn",
    ) as never;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("jwt.accessSecret"),
        expiresIn: accessExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("jwt.refreshSecret"),
        expiresIn: refreshExpiry,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
  }
}
