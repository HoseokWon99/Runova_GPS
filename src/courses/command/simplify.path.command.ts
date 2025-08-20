import { Command } from "@nestjs/cqrs";
import { SimplifyPathResult } from "../dto";
import { Coordinates } from "../../common/geo";

export class SimplifyPathCommand extends Command<SimplifyPathResult> {
    constructor(
        public readonly path: Coordinates[]
    ) { super(); }
}