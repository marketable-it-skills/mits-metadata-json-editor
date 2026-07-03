import { z } from 'zod';

const authorSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const metadataSchema = z
  .object({
    mode: z.enum(['project-task', 'tutorial']),
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    url: z.string(),
    skillDomainIds: z.array(z.number()),
    languages: z.array(z.string()),
    competition: z.string(),
    estTime: z.number(),
    authors: z.array(authorSchema),
    technologies: z.array(z.string()),
    tags: z.array(z.string()),
    competitionShortName: z.string(),
    moduleName: z.string(),
    moduleNames: z.record(z.string(), z.string()).optional(),
  })
  .superRefine((metadata, ctx) => {
    if (metadata.mode === 'project-task') {
      if (!metadata.competition.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['competition'],
          message: 'Competition is required.',
        });
      }

      if (!metadata.competitionShortName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['competitionShortName'],
          message: 'Competition short name is required.',
        });
      }

      if (!metadata.moduleName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['moduleName'],
          message: 'Module name is required.',
        });
      }

      if (!Number.isFinite(metadata.estTime) || metadata.estTime < 0.5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['estTime'],
          message: 'Estimated time must be at least 0.5 hours.',
        });
      }
    } else if (!metadata.name.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Name is required.',
      });
    }

    if (!metadata.displayName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['displayName'],
        message: 'Task topic is required.',
      });
    }

    if (!metadata.description.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'Description is required.',
      });
    }

    if (!metadata.url.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'URL is required.',
      });
    }

    if (metadata.authors.length === 0 || metadata.authors.every((author) => !author.name.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['authors'],
        message: 'At least one author with a name is required.',
      });
    }
  });

/** Light structural check on a freshly-parsed import payload, before it's dispatched. */
export function validateImportShape(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return 'The pasted content is not a JSON object.';

  const record = data as Record<string, unknown>;
  if (typeof record.name !== 'string') return 'Missing or invalid "name" field.';
  if (typeof record.displayName !== 'string') return 'Missing or invalid "displayName" field.';
  if (typeof record.description !== 'string') return 'Missing or invalid "description" field.';
  if (typeof record.url !== 'string') return 'Missing or invalid "url" field.';
  if (!Array.isArray(record.skillDomainIds)) return 'Missing or invalid "skillDomainIds" field.';
  if (!Array.isArray(record.languages)) return 'Missing or invalid "languages" field.';
  if (!Array.isArray(record.authors)) return 'Missing or invalid "authors" field.';
  if (!Array.isArray(record.technologies)) return 'Missing or invalid "technologies" field.';
  if (!Array.isArray(record.tags)) return 'Missing or invalid "tags" field.';

  return null;
}
