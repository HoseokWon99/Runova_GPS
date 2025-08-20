import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCourseNodesQuery } from "./get.course.nodes.query";
import { Course } from "../model";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { plainToInstanceOrReject } from "../../utils";
import { CourseNode } from "../dto";

@QueryHandler(GetCourseNodesQuery)
export class GetCourseNodesQueryHandler implements IQueryHandler<GetCourseNodesQuery> {

    constructor(
       @InjectDataSource()
       private readonly _ds: DataSource
    ) {}

    async execute(query: GetCourseNodesQuery): Promise<CourseNode[]> {
        const { tableName } = this._ds.getMetadata(Course);
        const { courseId } = query;

        const raws = await this._ds.sql`
            SELECT
                node.location AS location,
                node.progress AS progress,
                node.bearing AS bearing
            FROM ${tableName} AS course
            CROSS JOIN LATERAL (
                SELECT
                    jsonb_build_object(
                            'lon', ST_X(p),
                            'lat', ST_Y(p)
                    ) AS location,
                    ST_LineLocatePoint(course.path, p)  AS progress,
                    mod(
                        (theta - LAG(theta, 1, 0) OVER (ORDER BY idx) + 540)::numeric,
                        360
                    )::float8 - 180 AS bearing
                FROM (
                         SELECT
                             path[1] AS idx,
                             ST_StartPoint(geom) AS p,
                             degrees(ST_Azimuth(ST_StartPoint(geom), ST_EndPoint(geom))) AS theta
                         FROM ST_DumpSegments(ST_Transform(course.path, 4326))
                     ) AS seg
            ) AS node
            WHERE course.id = ${courseId}
        `;

        if (!(raws instanceof Array))
            throw Error(`Unexpected result ${raws}`);

        return Promise.all(
            raws.map(raw =>
                plainToInstanceOrReject(CourseNode, raw)
            )
        );
    }

}

