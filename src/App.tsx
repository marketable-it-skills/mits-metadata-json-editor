import Header from '@/components/header';
import MetadataForm from '@/components/editor/metadata-form';
import CollectionProvider from '@/components/providers/collection-provider';
import MetadataProvider from '@/components/providers/metadata-provider';
import TechTagProvider from '@/components/providers/tech-tag-provider';

export default function App() {
  return (
    <CollectionProvider>
      <TechTagProvider>
        <MetadataProvider>
          <div className='min-h-screen'>
            <Header />
            <main className='mx-auto w-full max-w-4xl px-4 pt-28 pb-20 sm:px-6'>
              <div className='mb-10 text-center sm:mb-12'>
                <h1 className='text-3xl font-bold tracking-tight'>Metadata Editor</h1>
                <p className='text-muted-foreground mx-auto mt-3 max-w-xl text-sm'>
                  Import, edit and export the metadata.json of a MITS project task — everything
                  stays in your browser.
                </p>
              </div>
              <MetadataForm />
            </main>
          </div>
        </MetadataProvider>
      </TechTagProvider>
    </CollectionProvider>
  );
}
