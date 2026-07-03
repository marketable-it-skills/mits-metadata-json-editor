import { useContext, useMemo } from 'react';
import { CollectionContext } from '@/components/providers/collection-provider';
import { TechTagContext } from '@/components/providers/tech-tag-provider';

export function useSuggestions() {
  const { collection } = useContext(CollectionContext);
  const { tags, technologies } = useContext(TechTagContext);

  const technologySuggestions = useMemo(
    () => [...new Set([...collection.flatMap((item) => item.technologies), ...technologies])],
    [collection, technologies],
  );

  const tagSuggestions = useMemo(
    () => [...new Set([...collection.flatMap((item) => item.tags), ...tags])],
    [collection, tags],
  );

  return { technologySuggestions, tagSuggestions };
}
