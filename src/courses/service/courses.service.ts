import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "../model";
import { In, Repository } from "typeorm";
import { CourseDTO, GetCoursesDTO } from "../dto";
import { Coordinates } from "../../common/geo";
import { Transactional } from "typeorm-transactional";
import { EventBus, QueryBus } from "@nestjs/cqrs";
import { EstimateTimeService } from "./estimate.time.service";
import { omit } from "../../utils/object";
import { CourseCreatedEvent } from "../event";
import { SimplifyPathQuery } from "../query";

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly _coursesRepo: Repository<Course>,
        @Inject(EstimateTimeService)
        private readonly _estimateTimeService: EstimateTimeService,
        @Inject(QueryBus)
        private readonly _queryBus: QueryBus,
        @Inject(EventBus)
        private readonly _eventBus: EventBus,
    ) {}

    @Transactional()
    async createCourse(userId: number, path: Coordinates[]): Promise<CourseDTO> {
        const { path: wkt, length } = await this._queryBus.execute(new SimplifyPathQuery(path));
        const timeRequired = this._estimateTimeService.estimateTime(length);

        const { generatedMaps } = await this._coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                userId, length, timeRequired,
                path: () => wkt,
            })
            .updateEntity(false)
            .returning("id")
            .execute();

       const course = await this._coursesRepo.findOneByOrFail({
           id: generatedMaps[0].id
       });

       this._eventBus.publish(new CourseCreatedEvent(course.id));
       return __toDTO(course);
    }

    async getCourses(dto: GetCoursesDTO): Promise<CourseDTO[]> {
        const { ids, userId } = dto;

        const courses = await this._coursesRepo.findBy({
            id: ids?.length && In(ids),
            userId,
        });

        return courses.map(__toDTO);
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this._coursesRepo.delete({ id, userId, });
    }

}

function __toDTO(course: Course): CourseDTO {
    return omit(course, ["userId", "createdAt", "updatedAt"]);
}
