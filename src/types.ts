import type { ActionDispatch, Dispatch, SetStateAction } from 'react';

export interface CollectionMetadata {
  name: string;
  displayName: string;
  description: string;
  url: string;
  skillDomainIds: number[];
  languages: string[];
  competition: string;
  estTime: number;
  authors: Author[];
  technologies: string[];
  tags: string[];
}

export interface Metadata extends CollectionMetadata {
  competitionShortName: string;
  moduleName: string;
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
  payload?: any;
}
