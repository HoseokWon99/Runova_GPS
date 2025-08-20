import { Query } from "@nestjs/cqrs";
import { SimplifyPathResult } from "../dto";
import { Coordinates } from "../../common/geo";

export class SimplifyPathQuery extends Query<SimplifyPathResult> {
    constructor(
        public readonly path: Coordinates[]
    ) { super(); }
}