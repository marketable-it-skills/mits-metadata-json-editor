import type { Metadata } from '@/types';

export const defaultMetadata: Metadata = {
  name: '',
  displayName: '',
  description: '',
  url: '',
  skillDomainIds: [1],
  languages: ['EN'],
  competition: '',
  estTime: 3,
  authors: [
    {
      name: '',
      url: '',
    },
  ],
  technologies: [],
  tags: [],

  competitionShortName: '',
  moduleName: '',
  mode: 'project-task',
};

export const defaultTutorialMetadata: Metadata = {
  name: '',
  displayName: '',
  description: '',
  url: '',
  skillDomainIds: [1],
  languages: ['EN'],
  competition: '',
  estTime: 3,
  authors: [
    {
      name: '',
      url: '',
    },
  ],
  technologies: [],
  tags: [],

  competitionShortName: '',
  moduleName: '',
  mode: 'tutorial',
  moduleNames: {},
};

export function getDefaultMetadata(mode: Metadata['mode']): Metadata {
  return mode === 'tutorial' ? defaultTutorialMetadata : defaultMetadata;
}

export const skillDomains = [
  {
    id: 1,
    name: 'Web Technologies',
    wsId: 'S17',
  },
  {
    id: 2,
    name: 'Software Application Development',
    wsId: 'S09',
  },
  {
    id: 3,
    name: 'Cloud Technologies',
    wsId: 'S49',
  },
];
