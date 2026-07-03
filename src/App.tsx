import CollectionProvider from './providers/CollectionProvider';
import MetadataProvider from './providers/MetadataProvider';
import TechTagProvider from './providers/TechTagProvider';

export default function App() {
  return (
    <CollectionProvider>
      <TechTagProvider>
        <MetadataProvider>
          <div>App</div>
        </MetadataProvider>
      </TechTagProvider>
    </CollectionProvider>
  );
}
