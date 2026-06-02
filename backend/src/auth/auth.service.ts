import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      name: registerDto.name,
      email,
      passwordHash,
      role: registerDto.role ?? UserRole.BUYER,
      country: registerDto.country,
      region: registerDto.region,
      city: registerDto.city,
      nationalAddress: registerDto.nationalAddress,
    });

    return this.createAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    const isPasswordValid = user ? await bcrypt.compare(loginDto.password, user.passwordHash) : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.createAuthResponse(user);
  }

  private createAuthResponse(user: Parameters<UsersService["toSafeUser"]>[0]) {
    const safeUser = this.usersService.toSafeUser(user);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: safeUser,
    };
  }
}
