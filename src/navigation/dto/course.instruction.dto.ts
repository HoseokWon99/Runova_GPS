import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";

@ApiExtraModels(Coordinates)
export class CourseInstructionDTO {
    @ApiProperty({ type: Coordinates })
    location: Coordinates;

    @ApiProperty({ type: "string" })
    text: string;
}