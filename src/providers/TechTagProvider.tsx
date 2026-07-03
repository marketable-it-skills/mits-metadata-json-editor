import type { TechTagContextType } from '@/types';
import { createContext, useEffect, useState, type ReactNode } from 'react';

export const TechTagContext = createContext<TechTagContextType>({
  tags: [],
  technologies: [],
  setTags: () => {},
  setTechnologies: () => {},
});

const TechTagProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<string[]>();
  const [technologies, setTechnologies] = useState<string[]>();

  // Load saved data
  useEffect(() => {
    const savedTags = localStorage.getItem('tags');
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    } else {
      setTags([]);
    }

    const savedTechnologies = localStorage.getItem('technologies');
    if (savedTechnologies) {
      setTechnologies(JSON.parse(savedTechnologies));
    } else {
      setTechnologies([]);
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (tags === undefined) return;
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    if (technologies === undefined) return;
    localStorage.setItem('technologies', JSON.stringify(technologies));
  }, [technologies]);

  if (tags === undefined || technologies === undefined) {
    return 'Loading...';
  }

  return (
    <TechTagContext.Provider value={{ tags, technologies, setTags, setTechnologies }}>
      {children}
    </TechTagContext.Provider>
  );
};
export default TechTagProvider;
