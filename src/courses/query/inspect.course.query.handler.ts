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

    async execute(query: InspectCourseQuery): Promise<InspectCourseQueryResult> {

        const raw = await this._ds
            .createQueryBuilder()
            .select(
                `jsonb_agg(metric.point)`,
                "points"
            )
            .addSelect(
                `array_agg(metric.measure)`,
                "measures"
            )
            .addSelect(
                `array_agg(metric.bearing)`,
                "bearings"
            )
            .from(Course, "course")
            .innerJoin(
                `
                LATERAL(
                    SELECT
                        jsonb_object_build(
                            'lon', ST_X(p1),
                            'lat', ST_Y(p1)
                        ) AS point,
                        ST_Azimuth(p1, p2) AS bearing,
                        ST_LineLocatePoint(
                            course.path, p1
                        ) * course.length AS measure
                    FROM (
                        SELECT
                            ST_StartPoint(geom) AS p1,
                            ST_EndPoint(geom) AS p2
                        FROM ST_DumpSegments(course.path) 
                    ) AS seg
                )
                `,
                "metric"
            )
            .where("course.id = :id", { id: query.id })
            .getRawOne();

        return plainToInstanceOrReject(
            InspectCourseQueryResult,
            raw
        );

    }

}