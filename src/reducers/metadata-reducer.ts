import { getDefaultMetadata, skillDomains } from '@/lib/data';
import type { Action, CollectionMetadata, Metadata, MetadataMode } from '@/types';

// Regenerates the name field from short name + wsId + module name,
// omitting empty segments and trimming extra spaces.
function generateName(state: Metadata): string {
  const skillDomain = skillDomains.find((x) => x.id === state.skillDomainIds[0]);
  return [state.competitionShortName, skillDomain?.wsId, state.moduleName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

// Renumbers a moduleNames record to contiguous "1".."N" keys, preserving order.
function renumberModules(moduleNames: Record<string, string>): Record<string, string> {
  const values = Object.keys(moduleNames)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => moduleNames[key]);
  return Object.fromEntries(values.map((value, index) => [String(index + 1), value]));
}

export function metadataReducer(state: Metadata | undefined, action: Action): Metadata | undefined {
  // -- Management actions: these create or replace the whole state, so they run
  // even when there is no current state (e.g. initial load from localStorage).
  switch (action.type) {
    // Replace the whole state
    case 'load':
      return action.payload;

    // Parses and imports a provided CollectionMetadata (or tutorial) object
    case 'import': {
      const payload = action.payload as CollectionMetadata & {
        moduleNames?: Record<string, string>;
      };
      const isTutorial = 'moduleNames' in payload;

      if (isTutorial) {
        const imported: Metadata = {
          ...payload,
          competition: '',
          estTime: 0,
          competitionShortName: '',
          moduleName: '',
          mode: 'tutorial',
          moduleNames: payload.moduleNames ?? {},
        };
        return imported;
      }

      const imported: Metadata = {
        ...payload,
        competitionShortName: '',
        moduleName: '',
        mode: 'project-task',
      };

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
    }

    // Restore the default template for the current mode, and clear the persisted metadata
    case 'reset':
      localStorage.removeItem('metadata');
      return getDefaultMetadata(state?.mode ?? 'project-task');
  }

  // -- Form actions below all require an existing state to modify.
  if (!state) return undefined;

  switch (action.type) {
    // Switches between project-task and tutorial editing modes
    case 'setMode': {
      const mode = action.payload as MetadataMode;
      if (mode === state.mode) return state;

      const next: Metadata = { ...state, mode };
      if (mode === 'project-task') {
        // Regenerate name from the project-task fields; tutorial free-text names
        // are left untouched when switching back into tutorial mode.
        next.name = generateName(next);
      } else if (!next.moduleNames) {
        next.moduleNames = {};
      }
      return next;
    }

    // Sets the value of a simple field
    case 'set': {
      const { field, value } = action.payload as { field: string; value: unknown };
      switch (field) {
        case 'name':
        case 'competition':
        case 'displayName':
        case 'description':
        case 'url':
        case 'estTime':
          return { ...state, [field]: value };
        case 'skill': {
          const next = { ...state, skillDomainIds: [value as number] };
          if (next.mode === 'project-task') next.name = generateName(next);
          return next;
        }
        case 'competitionShortName':
        case 'moduleName': {
          const next = { ...state, [field]: value } as Metadata;
          next.name = generateName(next);
          return next;
        }
        default:
          throw Error(`Field "${field}" is not supported by the 'set' action`);
      }
    }

    // Add a language
    case 'addLanguage':
      return { ...state, languages: [...state.languages, action.payload] };
    // Removes the specified language
    case 'removeLanguage':
      return { ...state, languages: state.languages.filter((x) => x !== action.payload) };
    // Replaces the full languages list
    case 'setLanguages':
      return { ...state, languages: action.payload as string[] };

    // Add a new, empty author entry
    case 'addAuthor':
      return { ...state, authors: [...state.authors, { name: '', url: '' }] };
    // Sets the name of the author at the specified index
    case 'setAuthorName':
      return {
        ...state,
        authors: state.authors.map((author, index) =>
          index === action.payload.index ? { ...author, name: action.payload.name } : author,
        ),
      };
    // Sets the url of the author at the specified index
    case 'setAuthorUrl':
      return {
        ...state,
        authors: state.authors.map((author, index) =>
          index === action.payload.index ? { ...author, url: action.payload.url } : author,
        ),
      };
    // Removes the author at the specified index
    case 'removeAuthor':
      return { ...state, authors: state.authors.toSpliced(action.payload, 1) };
    // Replaces the full authors list
    case 'setAuthors':
      return { ...state, authors: action.payload as Metadata['authors'] };

    // Add a new tag
    case 'addTag':
      return { ...state, tags: [...state.tags, action.payload] };
    // Remove the specified tag
    case 'removeTag':
      return { ...state, tags: state.tags.filter((x) => x !== action.payload) };
    // Replaces the full tags list
    case 'setTags':
      return { ...state, tags: action.payload as string[] };

    // Add a new technology
    case 'addTechnology':
      return { ...state, technologies: [...state.technologies, action.payload] };
    // Remove the specified technology
    case 'removeTechnology':
      return { ...state, technologies: state.technologies.filter((x) => x !== action.payload) };
    // Replaces the full technologies list
    case 'setTechnologies':
      return { ...state, technologies: action.payload as string[] };

    // Add a new, empty module entry (tutorial mode)
    case 'addModule': {
      const moduleNames = state.moduleNames ?? {};
      const nextKey = String(Object.keys(moduleNames).length + 1);
      return { ...state, moduleNames: { ...moduleNames, [nextKey]: '' } };
    }
    // Sets the name of the module at the specified key
    case 'setModuleName': {
      const { key, value } = action.payload as { key: string; value: string };
      return { ...state, moduleNames: { ...state.moduleNames, [key]: value } };
    }
    // Removes the module at the specified key, renumbering the rest
    case 'removeModule': {
      const key = action.payload as string;
      const moduleNames = { ...(state.moduleNames ?? {}) };
      delete moduleNames[key];
      return { ...state, moduleNames: renumberModules(moduleNames) };
    }
    // Reorders modules to match the given array of values
    case 'reorderModules': {
      const orderedValues = action.payload as string[];
      return {
        ...state,
        moduleNames: Object.fromEntries(
          orderedValues.map((value, index) => [String(index + 1), value]),
        ),
      };
    }
    // Replaces the full module names record
    case 'setModuleNames':
      return { ...state, moduleNames: action.payload as Metadata['moduleNames'] };

    default:
      throw Error(`Invalid action type "${action.type}"`);
  }
}
