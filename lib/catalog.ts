import type { Course, CourseId } from "./course"
import { jeansCourse } from "./content"
import { penguinCourse } from "./penguins"

export const courses: Course[] = [jeansCourse, penguinCourse]

export function courseById(id: CourseId): Course {
  return courses.find((course) => course.id === id) ?? jeansCourse
}
