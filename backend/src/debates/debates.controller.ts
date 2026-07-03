import { Body, Controller, Get, MessageEvent, Param, Post, Sse } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Observable } from "rxjs";

import { DebatesService } from "./debates.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateDebateDto } from "./dto/create-debate.dto";
import { DetectDto } from "./dto/detect.dto";
import { IntakeDto } from "./dto/intake.dto";

@Controller("debates")
export class DebatesController {
   constructor(private readonly debates: DebatesService) {}

   @Post()
   create(@Body() dto: CreateDebateDto) {
      return this.debates.create(dto);
   }

   @Get()
   list() {
      return { debates: [] };
   }

   @Post("detect")
   detect(@Body() dto: DetectDto) {
      return this.debates.detect(dto);
   }

   @Post("intake")
   intake(@Body() dto: IntakeDto) {
      return this.debates.intake(dto);
   }

   @Post("ping")
   pingStart() {
      return this.debates.pingStart();
   }

   @Get("ping/:checkId")
   pingStatus(@Param("checkId") checkId: string) {
      return this.debates.pingStatus(checkId);
   }

   @Get(":id")
   getOne(@Param("id") id: string) {
      return this.debates.getOne(id);
   }

   @Get(":id/final")
   getFinal(@Param("id") id: string) {
      return this.debates.getFinal(id);
   }

   @Sse(":id/stream")
   stream(@Param("id") id: string): Observable<MessageEvent> {
      return this.debates.stream(id);
   }

   @Post(":id/comments")
   createComment(@Param("id") id: string, @Body() dto: CreateCommentDto) {
      return {
         id: randomUUID(),
         debateId: id,
         content: dto.content.trim(),
         createdAt: new Date().toISOString(),
      };
   }

   @Get(":id/comments")
   listComments() {
      return { comments: [] };
   }
}
