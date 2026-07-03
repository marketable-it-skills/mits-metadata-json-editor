import { defaultMetadata } from '../lib/data';
import type { Metadata, MetadataContextType } from '@/types';
import { createContext, useEffect, useState, type ReactNode } from 'react';

export const MetadataContext = createContext<MetadataContextType>({
  metadata: defaultMetadata,
});

const MetadataProvider = ({ children }: { children: ReactNode }) => {
  const [metadata, setMetadata] = useState<Metadata>();

  // Load saved metadata
  useEffect(() => {
    const savedMetadata = localStorage.getItem('metadata');
    if (savedMetadata) {
      setMetadata(JSON.parse(savedMetadata));
    } else {
      setMetadata(defaultMetadata);
    }
  }, []);

  // Save metadata on change
  useEffect(() => {
    if (metadata === undefined) return;

    localStorage.setItem('metadata', JSON.stringify(metadata));
  }, [metadata]);

  if (metadata === undefined) {
    return 'Loading...';
  }

  return <MetadataContext.Provider value={{ metadata }}>{children}</MetadataContext.Provider>;
};

export default MetadataProvider;
