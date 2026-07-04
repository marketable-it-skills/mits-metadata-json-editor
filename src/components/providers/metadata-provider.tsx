import { metadataReducer } from '@/reducers/metadata-reducer';
import { defaultMetadata, getDefaultMetadata } from '@/lib/data';
import { METADATA_MODE_STORAGE_KEY, metadataStorageKey } from '@/lib/storage';
import type { Metadata, MetadataContextType } from '@/types';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import Loading from '../loading';

const MetadataContext = createContext<MetadataContextType>({
  metadata: defaultMetadata,
  dispatchMetadata: () => {},
});

export function useMetadata() {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
}

const MetadataProvider = ({ children }: { children: ReactNode }) => {
  const [metadata, dispatchMetadata] = useReducer(metadataReducer, undefined);

  // Load the saved metadata of the last active mode
  useEffect(() => {
    // One-time migration: older versions kept a single shared 'metadata' entry.
    const legacyMetadata = localStorage.getItem('metadata');
    if (legacyMetadata) {
      const legacyMode = (JSON.parse(legacyMetadata) as Metadata).mode ?? 'project-task';
      localStorage.setItem(metadataStorageKey(legacyMode), legacyMetadata);
      localStorage.removeItem('metadata');
    }

    const mode =
      localStorage.getItem(METADATA_MODE_STORAGE_KEY) === 'tutorial' ? 'tutorial' : 'project-task';
    const savedMetadata = localStorage.getItem(metadataStorageKey(mode));
    dispatchMetadata({
      type: 'load',
      payload: savedMetadata ? JSON.parse(savedMetadata) : getDefaultMetadata(mode),
    });
  }, []);

  // Save the current mode's metadata on change
  useEffect(() => {
    if (metadata === undefined) return;

    localStorage.setItem(metadataStorageKey(metadata.mode), JSON.stringify(metadata));
    localStorage.setItem(METADATA_MODE_STORAGE_KEY, metadata.mode);
  }, [metadata]);

  if (metadata === undefined) {
    return <Loading />;
  }

  return (
    <MetadataContext.Provider value={{ metadata, dispatchMetadata }}>
      {children}
    </MetadataContext.Provider>
  );
};

export default MetadataProvider;
