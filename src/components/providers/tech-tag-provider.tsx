import type { TechTagContextType } from '@/types';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import Loading from '../loading';

export const TechTagContext = createContext<TechTagContextType>({
  tags: [],
  technologies: [],
  setTags: () => {},
  setTechnologies: () => {},
});

const TechTagProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<string[]>();
  const [technologies, setTechnologies] = useState<string[]>();

  // Load saved data once on mount. The synchronous setState here is intentional:
  // it hydrates from localStorage before first paint (guarded by the loading gate below).
  useEffect(() => {
    const savedTags = localStorage.getItem('tags');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTags(savedTags ? JSON.parse(savedTags) : []);

    const savedTechnologies = localStorage.getItem('technologies');
    setTechnologies(savedTechnologies ? JSON.parse(savedTechnologies) : []);
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
    return <Loading />;
  }

  return (
    <TechTagContext.Provider value={{ tags, technologies, setTags, setTechnologies }}>
      {children}
    </TechTagContext.Provider>
  );
};
export default TechTagProvider;
