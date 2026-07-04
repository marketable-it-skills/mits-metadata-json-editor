import { metadataReducer } from '@/reducers/metadata-reducer';
import { defaultMetadata } from '@/lib/data';
import type { MetadataContextType } from '@/types';
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

  // Load saved metadata
  useEffect(() => {
    const savedMetadata = localStorage.getItem('metadata');
    if (savedMetadata) {
      dispatchMetadata({ type: 'load', payload: JSON.parse(savedMetadata) });
    } else {
      dispatchMetadata({ type: 'load', payload: defaultMetadata });
    }
  }, []);

  // Save metadata on change
  useEffect(() => {
    if (metadata === undefined) return;

    localStorage.setItem('metadata', JSON.stringify(metadata));
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
