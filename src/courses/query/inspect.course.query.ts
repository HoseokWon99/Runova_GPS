import { Query } from "@nestjs/cqrs";
import { InspectCourseQueryResult } from "./inspect.course.query.result";

export class InspectCourseQuery extends Query<InspectCourseQueryResult> {
    constructor(public readonly id: number) {
        super();
    }
}