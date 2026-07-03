import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateDebateDto {
   @IsString()
   @IsNotEmpty()
   thesis!: string;

   @IsOptional()
   @IsIn(["CONVERGENT", "DIVERGENT", "GEOPOLITICAL"])
   mode?: string;

   @IsOptional()
   @IsIn(["VERIFY", "QUANTUM", ""])
   strategy?: string;

   @IsOptional()
   @IsInt()
   @Min(1)
   @Max(10)
   maxRounds?: number;

   @IsOptional()
   @IsArray()
   @IsString({ each: true })
   models?: string[];

   @IsOptional()
   @IsString()
   debateId?: string;
}
