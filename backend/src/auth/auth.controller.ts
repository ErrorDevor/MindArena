import { Body, Controller, Post } from "@nestjs/common";
import { randomUUID } from "crypto";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
   @Post("login")
   login(@Body() _dto: LoginDto) {
      return { accessToken: `dev-${randomUUID()}`, refreshToken: `dev-${randomUUID()}` };
   }

   @Post("register")
   register(@Body() _dto: RegisterDto) {
      return { accessToken: `dev-${randomUUID()}`, refreshToken: `dev-${randomUUID()}` };
   }
}
