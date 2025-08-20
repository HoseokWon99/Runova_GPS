import { IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { Coordinates } from "../../common/geo";

export class InterpolateLocationResult {
    // 보간점의 상대 위치 (0 ~ 1 사이의 실수)
    @IsNumber()
    progress: number;

    // 보간점의 좌표
    @Type(() => Coordinates)
    location: Coordinates;

    // 거리 오차 <=> 실제 위치와 보간점 사이의 거리
    @IsNumber()
    epsilon: number;

    // 각도 오차 <=> 현재 위치와 보간점 사이의 방위각(azimuth angle)
    @IsNumber()
    theta: number;
}