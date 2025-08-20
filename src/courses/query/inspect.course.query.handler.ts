import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InspectCourseQuery } from "./inspect.course.query";
import { InspectCourseQueryResult } from "./inspect.course.query.result";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Course } from "../model";
import { plainToInstanceOrReject } from "../../utils";

@QueryHandler(InspectCourseQuery)
export class InspectCourseQueryHandler
    implements IQueryHandler<InspectCourseQuery>
{
    constructor(
        @InjectDataSource()
        private readonly _ds: DataSource,
    ) {}

    async execute({ path }: InspectCourseQuery): Promise<InspectCourseQueryResult> {

        const raw = await this._ds.sql`
        WITH path AS (
            ST_Simplify(
                
            )
        )
        SELECT
        FROM 
        `;

        return plainToInstanceOrReject(
            InspectCourseQueryResult,
            raw
        );

    }

}