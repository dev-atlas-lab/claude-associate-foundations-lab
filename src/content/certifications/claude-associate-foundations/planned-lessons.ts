import { z } from "zod";
import { plannedLessonSchema, type PlannedLesson } from "../../../domain";

/**
 * Visible roadmap entries. They are not routable until written and reviewed.
 *
 * All seven exam domains now have a published, exam-mapped curriculum lesson.
 * The list stays empty rather than advertising unstarted work; add an entry only
 * when a specific lesson is genuinely queued for writing and review.
 */
export const plannedLessons: PlannedLesson[] = z.array(plannedLessonSchema).parse([]);
