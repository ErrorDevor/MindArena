import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from "class-validator";

export class IntakeMessageDto {
   @IsIn(["user", "assistant"])
   role!: string;

   @IsString()
   content!: string;
}

export class IntakeDto {
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => IntakeMessageDto)
   messages!: IntakeMessageDto[];

   @IsOptional()
   @IsIn(["VERIFY", "QUANTUM", ""])
   strategy?: string;

   @IsOptional()
   @IsIn(["CONVERGENT", "DIVERGENT", "GEOPOLITICAL"])
   mode?: string;

   @IsOptional()
   @IsString()
   locale?: string;
}
