import { Query } from "@nestjs/cqrs";
import { CourseNode } from "../dto";

export class GetCourseNodesQuery extends Query<CourseNode[]>{
    constructor(
        public readonly courseId: number,
    ) { super(); }
}