import { Query } from "@nestjs/cqrs";
import { InspectCourseQueryResult } from "./inspect.course.query.result";
import { Coordinates } from "../../common/geo";

export class InspectCourseQuery extends Query<InspectCourseQueryResult> {
    constructor(
        public readonly path: Coordinates[]
    ) { super(); }
}