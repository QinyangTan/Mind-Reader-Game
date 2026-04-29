import { animalQuestions } from "@/lib/data/question-bank/animals";
import { expandedQuestions } from "@/lib/data/question-bank/expanded";
import { expandedQuestionsV2 } from "@/lib/data/question-bank/expanded-v2";
import { expandedQuestionsV3 } from "@/lib/data/question-bank/expanded-v3";
import { fictionalQuestions } from "@/lib/data/question-bank/fictional";
import { foodQuestions } from "@/lib/data/question-bank/foods";
import { historicalFigureQuestions } from "@/lib/data/question-bank/historical";
import { questionGroupMeta } from "@/lib/data/question-bank/meta";
import { objectQuestions } from "@/lib/data/question-bank/objects";
import { productionDepthQuestions } from "@/lib/data/question-bank/production-depth";
import { productionV5Questions } from "@/lib/data/question-bank/production-v5";
import { productionV6Questions } from "@/lib/data/question-bank/production-v6";
import { productionV7Questions } from "@/lib/data/question-bank/production-v7";
import { productionV8Questions } from "@/lib/data/question-bank/production-v8";
import type { QuestionDefinition, QuestionGroup } from "@/types/game";

export { questionGroupMeta, questionStageMeta, questionStageOrder } from "@/lib/data/question-bank/meta";

export const allQuestions: readonly QuestionDefinition[] = Object.freeze([
  ...fictionalQuestions,
  ...animalQuestions,
  ...objectQuestions,
  ...foodQuestions,
  ...historicalFigureQuestions,
  ...expandedQuestions,
  ...expandedQuestionsV2,
  ...expandedQuestionsV3,
  ...productionDepthQuestions,
  ...productionV5Questions,
  ...productionV6Questions,
  ...productionV7Questions,
  ...productionV8Questions,
]);

export const questionById = new Map(allQuestions.map((question) => [question.id, question]));

export function getQuestionGroupLabel(group: QuestionGroup) {
  return questionGroupMeta[group].label;
}
