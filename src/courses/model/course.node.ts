import { Type } from "class-transformer";
import { Coordinates } from "../../common/geo";
import { IsNumber, ValidateNested } from "class-validator";

export class CourseNode {
    @ValidateNested()
    @Type(() => Coordinates)
    location: Coordinates;

    @IsNumber()
    measure: number;

    @IsNumber()
    bearing: number;
}