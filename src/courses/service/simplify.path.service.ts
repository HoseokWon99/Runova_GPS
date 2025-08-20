import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Coordinates } from "../../common/geo";
import { plainToInstanceOrReject } from "../../utils";
import { ConfigService } from "@nestjs/config";
import { SimplifyPathResult } from "../dto";

@Injectable()
export class SimplifyPathService {
    private readonly _tol: number;

    constructor(
       @InjectDataSource()
       private readonly _ds: DataSource,
       @Inject(ConfigService)
       config: ConfigService,
    ) {
        this._tol = config.get<number>(
            "GIS_SIMPLIFY_TOLERANCE"
        ) ?? 0.000008;
    }

    async simplify(path: Coordinates[]): Promise<SimplifyPathResult> {

        const raw = await this._ds
            .createQueryBuilder()
            .addCommonTableExpression(
                `
                SELECT ST_Simplify(
                    ST_SetSRID(ST_GeomFromText(:wkt), 4326), 
                    :tolerance
                )
                AS geom
                `,
                "simplified"
            )
            .select(`s.geom`, "path")
            .addSelect(`ST_Length(ST_Transform(s.geom, 5179))`, "length")
            .addSelect(`floor((l.len / :pace) * 1000)`, "time")
            .from("simplified", "s")
            .setParameters({
                wkt: __toLineString(path),
                tolerance: this._tol,
            })
            .getRawOne();

        return plainToInstanceOrReject(SimplifyPathResult, raw);
    }


}

function __toLineString(path: Coordinates[]): string {

    const inner = path.map(({ lon, lat }) =>
        `${lon} ${lat}`
    ).join(",");

    return `LINESTRING (${inner})`;
}




