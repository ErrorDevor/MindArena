import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class DetectDto {
   @IsString()
   @IsNotEmpty()
   thesis!: string;

   @IsOptional()
   @IsArray()
   @IsString({ each: true })
   models?: string[];

   @IsOptional()
   @IsInt()
   @Min(1)
   @Max(10)
   maxRounds?: number;
}
