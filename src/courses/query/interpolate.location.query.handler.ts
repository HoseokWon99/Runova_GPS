import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InterpolateLocationQuery } from "./interpolate.location.query";
import { InterpolateLocationResult } from "../dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { Course } from "../model";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { plainToInstanceOrReject } from "../../utils";

@QueryHandler(InterpolateLocationQuery)
export class InterpolateLocationQueryHandler
    implements IQueryHandler<InterpolateLocationQuery> {

    constructor(
       @InjectDataSource()
       private readonly _ds: DataSource,
    ) {}

    async execute(
        query: InterpolateLocationQuery
    ): Promise<InterpolateLocationResult> {
        const { courseId, location } = query;

        const qb = this._ds
            .createQueryBuilder()
            .addCommonTableExpression(
                `SELECT ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geom`,
                "curr"
            )
            .select("p.progress", "progress")
            .addSelect(
                `
                jsonb_build_object(
                    'lon', ST_X(itp.geom),
                    'lat', ST_Y(itp.geom)
                )
                `,
                "interpolated"
            )
            .addSelect(
                `
                ST_Distance(
                    ST_Transform(curr.geom, 5179),
                    ST_Transform(itp.geom, 5179),
                )
                `,
                "epsilon"
            )
            .addSelect(
                `ST_Azimuth(curr.geom, itp.geom)`,
                "theta"
            )
            .from("curr", "curr")
            .innerJoin(Course, "course", "course.id = :id");

        qb.innerJoin(
                `LATERAL (${__makeSelectProgressClause(qb)})`,
            "f"
        );

        qb.innerJoin(
            `LATERAL (${__makeSelectInterpolatedClause(qb)})`,
            "itp"
        );

        const raw = await qb
            .setParameters({ id: courseId, ...location, })
            .getRawOne();

        if (!raw) throw new NotFoundException();

        return plainToInstanceOrReject(
            InterpolateLocationResult,
            raw
        );
    }

}

function __makeSelectProgressClause(qb: SelectQueryBuilder<any>): string {
    return qb.subQuery()
        .select(
            `ST_LineInterpolatePoint(course.path, curr.geom)`,
            "progress"
        ).getQuery();
}

function __makeSelectInterpolatedClause(qb: SelectQueryBuilder<any>): string {
    return qb.subQuery()
        .select(
            `ST_LineInterpolatePoint(course.path, f.frac)`,
            "geom"
        )
        .getQuery();
}

