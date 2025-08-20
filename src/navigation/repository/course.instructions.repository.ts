import { Inject, Injectable } from "@nestjs/common";
import Redis from "iovalkey";
import { CourseInstruction } from "../model";
import { plainToInstanceOrReject } from "../../utils";

@Injectable()
export class CourseInstructionsRepository {

    constructor(
       @Inject(Redis)
       private readonly _redis: Redis,
    ) {}

    async save(
        courseId: number,
        instructions: CourseInstruction[]
    ): Promise<void> {

        const entries = instructions.map(inst =>
            [inst.measure, JSON.stringify(inst)] as [number, string]
        );

        await this._redis.zadd(
            __makeKey(courseId),
            ...entries.flat(),
        );
    }

    async findByRange(
        courseId: number,
        lower: number,
        upper: number,
    ): Promise<CourseInstruction[]> {

        const raws = await this._redis
            .zrangebyscore(__makeKey(courseId), lower, upper);

        return Promise.all(
            raws.map(raw =>
                plainToInstanceOrReject(CourseInstruction, raw)
            )
        );
    }

    async delete(courseId: number): Promise<void> {
        await this._redis.del(__makeKey(courseId));
    }
}

function __makeKey(courseId: number): string {
    return `course:${courseId}:instructions`;
}