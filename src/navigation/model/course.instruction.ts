import { Coordinates } from "../../common/geo";
import { IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CourseInstruction {
    @IsNumber()
    measure: number;

    @ValidateNested()
    @Type(() => Coordinates)
    location: Coordinates;

    @IsString()
    text: string;
}