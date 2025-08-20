import { IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Coordinates } from "../../common/geo";

export class InspectCourseQueryResult {
    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    points: Coordinates[];

    @IsNumber({}, { each: true })
    measures: number[];

    @IsNumber({}, { each: true })
    bearings: number[];
}