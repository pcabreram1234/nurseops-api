import { Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityMatchingService {
  match(nurseSkills: string[], requiredSkills: string[]) {
    return requiredSkills.every((skill) => nurseSkills.includes(skill));
  }
}
