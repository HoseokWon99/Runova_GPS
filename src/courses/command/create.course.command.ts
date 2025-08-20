import { Command } from "@nestjs/cqrs";
import { CourseDTO } from "../dto";

export class CreateCourseCommand extends Command<CourseDTO> {

}