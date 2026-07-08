import type { Author, Metadata } from '@/types';

export interface ProjectTaskExport {
  name: string;
  displayName: string;
  description: string;
  skillDomainIds: number[];
  languages: string[];
  competition: string;
  estTime: number;
  authors: Author[];
  technologies: string[];
  tags: string[];
}

export interface TutorialExport {
  name: string;
  displayName: string;
  description: string;
  skillDomainIds: number[];
  languages: string[];
  authors: Author[];
  technologies: string[];
  tags: string[];
  moduleNames: Record<string, string>;
}

/**
 * Builds the plain, exportable JSON shape from editor state: strips the
 * editor-only fields, and drops project-task/tutorial fields that don't
 * apply to the current mode.
 */
export function toExportJson(metadata: Metadata): ProjectTaskExport | TutorialExport {
  const {
    name,
    displayName,
    description,
    skillDomainIds,
    languages,
    authors,
    technologies,
    tags,
    competition,
    estTime,
    moduleNames,
    mode,
  } = metadata;

  const shared = { name, displayName, description, skillDomainIds, languages, authors, technologies, tags };

  if (mode === 'tutorial') {
    return { ...shared, moduleNames: moduleNames ?? {} };
  }

  return { ...shared, competition, estTime };
}
