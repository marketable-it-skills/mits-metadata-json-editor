import type { CollectionContextType, Metadata } from '@/types';
import { createContext, useEffect, useState, type ReactNode } from 'react';

export const CollectionContext = createContext<CollectionContextType>({ collection: [] });

const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [collection, setCollection] = useState<Metadata[]>();

  // Load collection.json
  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/marketable-it-skills/mits-collection/refs/heads/main/collection.json',
    )
      .then((res) => res.json())
      .then((data) => setCollection(data));
  }, []);

  if (collection === undefined) {
    return 'Loading...';
  }

  return <CollectionContext.Provider value={{ collection }}>{children}</CollectionContext.Provider>;
};
export default CollectionProvider;
