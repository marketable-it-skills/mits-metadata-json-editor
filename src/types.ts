import type { ActionDispatch, Dispatch, SetStateAction } from 'react';

export interface CollectionMetadata {
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

export type MetadataMode = 'project-task' | 'tutorial';

export interface Metadata extends CollectionMetadata {
  competitionShortName: string;
  moduleName: string;
  mode: MetadataMode;
  /** Tutorial-only: ordered module names keyed by their 1-based position as a string. */
  moduleNames?: Record<string, string>;
}

export interface Author {
  name: string;
  url: string;
}

// Providers

export interface MetadataContextType {
  metadata: Metadata;
  dispatchMetadata: ActionDispatch<[action: Action]>;
}

export interface CollectionContextType {
  collection: CollectionMetadata[];
}

export interface TechTagContextType {
  tags: string[];
  technologies: string[];
  setTags: Dispatch<SetStateAction<string[] | undefined>>;
  setTechnologies: Dispatch<SetStateAction<string[] | undefined>>;
}

// Generic

export interface Action {
  type: string;
  // Payloads are heterogeneous per action type and narrowed inside the reducer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}
