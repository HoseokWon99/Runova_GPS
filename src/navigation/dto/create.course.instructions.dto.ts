import { Coordinates } from "../../common/geo";

export interface CreateCourseInstructionsDTO {
    courseId: number;
    points: Coordinates[];
    measures: number[];
    bearings: number[];
}