import { defaultMetadata, skillDomains } from '@/lib/data';
import type { Action, CollectionMetadata, Metadata } from '@/types';

export function metadataReducer(state: Metadata | undefined, action: Action): Metadata | undefined {
  if (!state) return undefined;

  switch (action.type) {
    // -- Form actions
    // Sets the value of a simple field
    case 'set':
      const { field, value } = action.payload as { field: string; value: unknown };
      switch (field) {
        case 'competition':
        case 'displayName':
        case 'description':
        case 'url':
        case 'estTime':
          const newState = { ...state };
          // @ts-ignore
          newState[field] = value;
          return newState;
        case 'skill':
          return { ...state, skillDomainIds: [value as number] };
        case 'competitionShortName':
        case 'moduleName':
          const newState2 = { ...state };
          // @ts-ignore
          newState2[field] = value;

          // Generate name field's value
          const skillDomain = skillDomains.find((x) => x.id === newState2.skillDomainIds[0]);
          newState2.name = `${newState2.competitionShortName} ${skillDomain?.wsId} ${newState2.moduleName}`;

          return newState2;
        default:
          throw Error(`Field "${field} is not supported by the 'set' action"`);
      }

    // Add a language
    case 'addLanguage':
      return { ...state, languages: [...state.languages, action.payload] };
    // Removes the specified language
    case 'removeLanguage':
      return { ...state, languages: state.languages.filter((x) => x !== action.payload) };

    // Add a new, empty author entry
    case 'addAuthor':
      return { ...state, authors: [...state.authors, { name: '', url: '' }] };
    // Sets the name of the author at the specified index
    case 'setAuthorName':
      let newAuthors = [...state.authors];
      newAuthors[action.payload.index].name = action.payload.name;
      return { ...state, authors: newAuthors };
    // Sets the url of the author at the specified index
    case 'setAuthorName':
      let newAuthors2 = [...state.authors];
      newAuthors2[action.payload.index].url = action.payload.url;
      return { ...state, authors: newAuthors2 };
    // Removes the author at the specified index
    case 'removeAuthor':
      return { ...state, authors: state.authors.toSpliced(action.payload, 1) };

    // Add a new tag
    case 'addTag':
      return { ...state, tags: [...state.tags, action.payload] };
    // Remove the specified tag
    case 'removeTag':
      return { ...state, tags: state.tags.filter((x) => x !== action.payload) };

    // Add a new technology
    case 'addTechnology':
      return { ...state, technologies: [...state.technologies, action.payload] };
    // Remove the specified technology
    case 'removeTechnology':
      return { ...state, technologies: state.technologies.filter((x) => x !== action.payload) };

    // -- Management actions
    // Replace the whole state
    case 'load':
      return action.payload;

    // Parses and imports a provided CollectionMetadata object
    case 'import':
      const payload = action.payload as CollectionMetadata;
      const imported: Metadata = { ...payload, competitionShortName: '', moduleName: '' };

      // Parse the name field
      if (imported.name) {
        const tokens = imported.name.trim().split(' ');

        imported.competitionShortName = tokens[0];

        const foundSkill = skillDomains.find((x) => x.wsId == tokens[1]);
        if (foundSkill) {
          imported.skillDomainIds = [foundSkill.id];
        }

        imported.moduleName = tokens.slice(2).join(' ');
      }

      return imported;

    // Restore the default template, and clear the persisted metadata
    case 'reset':
      localStorage.removeItem('metadata');
      return defaultMetadata;

    default:
      throw Error(`Invalid action type "${action.type}"`);
  }
}
