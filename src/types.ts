import type { Dispatch, SetStateAction } from 'react';

export interface Metadata {
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

export interface Author {
  name: string;
  url: string;
}

// Providers

export interface MetadataContextType {
  metadata: Metadata;
}

export interface CollectionContextType {
  collection: Metadata[];
}

export interface TechTagContextType {
  tags: string[];
  technologies: string[];
  setTags: Dispatch<SetStateAction<string[] | undefined>>;
  setTechnologies: Dispatch<SetStateAction<string[] | undefined>>;
}
