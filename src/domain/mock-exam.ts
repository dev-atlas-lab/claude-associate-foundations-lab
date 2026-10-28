/**
 * Deterministic blueprint-weighted selection for the mock-exam preview.
 *
 * The selector never invents questions: each domain pool contains only reviewed
 * bank items. When the bank is smaller than the requested exam, the selector
 * returns every available item and reports the shortfall instead of duplicating
 * or fabricating filler.
 */

export interface MockExamDomainPool {
  domainId: string;
  weightPercent: number;
  questionIds: readonly string[];
}

export interface MockExamAllocation {
  domainId: string;
  weightPercent: number;
  available: number;
  allocated: number;
}

export interface MockExamSelection {
  requested: number;
  selectedQuestionIds: string[];
  allocations: MockExamAllocation[];
  shortfall: number;
}

interface NormalizedPool {
  domainId: string;
  weightPercent: number;
  questionIds: string[];
}

function normalizePools(pools: readonly MockExamDomainPool[]): NormalizedPool[] {
  const claimed = new Set<string>();

  return pools.map((pool) => {
    const questionIds = [...new Set(pool.questionIds)]
      .filter((questionId) => {
        if (claimed.has(questionId)) {
          return false;
        }

        claimed.add(questionId);
        return true;
      })
      .sort();

    return {
      domainId: pool.domainId,
      weightPercent: pool.weightPercent,
      questionIds,
    };
  });
}

/**
 * Greedy largest-deficit allocation. Each step gives the next slot to the
 * domain furthest below its ideal weighted share, skipping domains whose
 * reviewed pool is exhausted. This respects both weights and availability.
 */
function allocate(pools: NormalizedPool[], target: number): number[] {
  const allocated = pools.map(() => 0);
  const ideal = pools.map((pool) => (pool.weightPercent / 100) * target);

  for (let slot = 0; slot < target; slot += 1) {
    let bestIndex = -1;
    let bestDeficit = Number.NEGATIVE_INFINITY;

    pools.forEach((pool, index) => {
      if (allocated[index]! >= pool.questionIds.length) {
        return;
      }

      const deficit = ideal[index]! - allocated[index]!;

      if (deficit > bestDeficit) {
        bestDeficit = deficit;
        bestIndex = index;
      }
    });

    if (bestIndex === -1) {
      break;
    }

    allocated[bestIndex] = allocated[bestIndex]! + 1;
  }

  return allocated;
}

/** Round-robin the allocated pools so the preview mixes domains instead of grouping them. */
function interleave(pools: NormalizedPool[], allocated: number[]): string[] {
  const queues = pools.map((pool, index) => pool.questionIds.slice(0, allocated[index]));
  const selected: string[] = [];
  let added = true;

  while (added) {
    added = false;

    for (const queue of queues) {
      const next = queue.shift();

      if (next !== undefined) {
        selected.push(next);
        added = true;
      }
    }
  }

  return selected;
}

function fnv1a(value: string, seed: number): number {
  let hash = seed >>> 0;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash >>> 0;
}

/**
 * Stable pseudo-random ordering derived from the attempt seed. This is not a
 * security primitive; it only prevents every attempt from seeing the same
 * presentation order while keeping a reload byte-for-byte reproducible from the
 * persisted question snapshot.
 */
function orderBySeed(questionIds: readonly string[], seed: string): string[] {
  return [...questionIds].sort((left, right) => {
    const rank =
      fnv1a(`${seed}:${left}`, 0x811c9dc5) - fnv1a(`${seed}:${right}`, 0x811c9dc5);

    return rank === 0 ? left.localeCompare(right) : rank;
  });
}

/**
 * Seeded variant used by the timed simulation. Allocation still follows the
 * published domain weights and availability caps; the seed only chooses which
 * reviewed items fill the slots and the final presentation order.
 */
export function selectTimedExamQuestions(
  pools: readonly MockExamDomainPool[],
  requested: number,
  seed: string,
): MockExamSelection {
  const trimmedSeed = seed.trim();

  if (trimmedSeed === "") {
    throw new Error("a timed-exam seed is required");
  }

  const normalized = normalizePools(pools).map((pool) => ({
    ...pool,
    questionIds: orderBySeed(pool.questionIds, `${trimmedSeed}:pool:${pool.domainId}`),
  }));
  const selection = selectFromNormalized(normalized, requested);

  return {
    ...selection,
    selectedQuestionIds: orderBySeed(
      selection.selectedQuestionIds,
      `${trimmedSeed}:attempt`,
    ),
  };
}

function selectFromNormalized(
  normalized: NormalizedPool[],
  requested: number,
): MockExamSelection {
  if (!Number.isInteger(requested) || requested < 1) {
    throw new RangeError("requested item count must be a positive integer");
  }

  const totalAvailable = normalized.reduce(
    (total, pool) => total + pool.questionIds.length,
    0,
  );
  const target = Math.min(requested, totalAvailable);
  const allocated = allocate(normalized, target);
  const selectedQuestionIds = interleave(normalized, allocated);

  return {
    requested,
    selectedQuestionIds,
    allocations: normalized.map((pool, index) => ({
      domainId: pool.domainId,
      weightPercent: pool.weightPercent,
      available: pool.questionIds.length,
      allocated: allocated[index]!,
    })),
    shortfall: requested - selectedQuestionIds.length,
  };
}

export function selectMockExamQuestions(
  pools: readonly MockExamDomainPool[],
  requested: number,
): MockExamSelection {
  return selectFromNormalized(normalizePools(pools), requested);
}
