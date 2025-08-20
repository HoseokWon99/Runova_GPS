import { Inject, Injectable } from "@nestjs/common";
import { CourseInstructionsRepository } from "../repository";

@Injectable()
export class CourseInstructionsService {

    constructor(
       @Inject(CourseInstructionsRepository)
       private readonly _instructionsRepo: CourseInstructionsRepository,
    ) {}

}