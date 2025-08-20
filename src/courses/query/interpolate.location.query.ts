import { Query } from "@nestjs/cqrs";
import { InterpolateLocationResult } from "../dto";
import { Coordinates } from "../../common/geo";

export class InterpolateLocationQuery extends Query<InterpolateLocationResult> {
    constructor(
        public readonly courseId: number,
        public readonly location: Coordinates,
    ) { super(); }
}