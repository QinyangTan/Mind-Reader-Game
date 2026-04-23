import { animalQuestions } from "@/lib/data/question-bank/animals";
import { fictionalQuestions } from "@/lib/data/question-bank/fictional";
import { foodQuestions } from "@/lib/data/question-bank/foods";
import { historicalFigureQuestions } from "@/lib/data/question-bank/historical";
import { questionGroupMeta } from "@/lib/data/question-bank/meta";
import { objectQuestions } from "@/lib/data/question-bank/objects";
import type { QuestionDefinition, QuestionGroup } from "@/types/game";

export { questionGroupMeta, questionStageMeta, questionStageOrder } from "@/lib/data/question-bank/meta";

export const allQuestions: readonly QuestionDefinition[] = Object.freeze([
  ...fictionalQuestions,
  ...animalQuestions,
  ...objectQuestions,
  ...foodQuestions,
  ...historicalFigureQuestions,
]);

export const questionById = new Map(allQuestions.map((question) => [question.id, question]));

export function getQuestionGroupLabel(group: QuestionGroup) {
  return questionGroupMeta[group].label;
}
