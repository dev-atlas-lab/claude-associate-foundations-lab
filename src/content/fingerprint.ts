import { allQuestions, contentPack, questionBankEntries } from "./index";

/**
 * A stable fingerprint of everything that affects saved-attempt validity:
 * assessment definitions, question answer keys, bank mappings, and blueprint
 * weights. Explanations and lesson prose are deliberately excluded because
 * changing them does not change a score.
 *
 * This is a compatibility check, not a cryptographic hash. Two independent
 * 32-bit FNV-1a passes are combined to make accidental collisions unlikely for
 * a local, single-user store.
 */
function fnv1a(value: string, seed: number): string {
  let hash = seed >>> 0;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

const payload = {
  schema: 1,
  assessments: [...contentPack.assessments]
    .map((assessment) => ({
      id: assessment.id,
      questionIds: assessment.questionIds,
      policy: assessment.policy,
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
  questions: [...allQuestions]
    .map((question) => ({
      id: question.id,
      type: question.type,
      choiceIds: question.choices.map((choice) => choice.id),
      correctChoiceIds: question.correctChoiceIds,
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
  bank: [...questionBankEntries]
    .map((entry) => ({
      id: entry.question.id,
      objectiveIds: entry.examMapping.objectiveIds,
      status: entry.examMapping.status,
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
  blueprint: contentPack.blueprints
    .map((blueprint) => ({
      id: blueprint.id,
      version: blueprint.version,
      domains: blueprint.domains.map((domain) => ({
        id: domain.id,
        weightPercent: domain.weightPercent,
        objectiveIds: domain.objectives.map((objective) => objective.id),
      })),
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
};

const serialized = JSON.stringify(payload);

export const contentFingerprint = `study-v1-${fnv1a(serialized, 0x811c9dc5)}${fnv1a(
  serialized,
  0x01000193,
)}`;
