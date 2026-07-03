import { useId } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Author } from '@/types';

type AuthorsFieldProps = {
  authors: Author[];
  onChange: (authors: Author[]) => void;
  error?: string;
};

export default function AuthorsField({ authors, onChange, error }: AuthorsFieldProps) {
  const fieldPrefix = useId();

  return (
    <div className='grid gap-2'>
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2'>
        <Label htmlFor={`${fieldPrefix}-name-0`}>
          Name<span className='text-destructive'>*</span>
        </Label>
        <Label className='text-muted-foreground'>URL (optional)</Label>
        <span
          className='w-8'
          aria-hidden='true'
        />
      </div>
      {authors.map((author, index) => (
        <div
          key={index}
          className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2'
        >
          <Input
            id={`${fieldPrefix}-name-${index}`}
            value={author.name}
            onChange={(event) =>
              onChange(
                authors.map((currentAuthor, currentIndex) =>
                  currentIndex === index
                    ? { ...currentAuthor, name: event.target.value }
                    : currentAuthor,
                ),
              )
            }
            placeholder='Author name'
          />
          <Input
            id={`${fieldPrefix}-url-${index}`}
            type='url'
            value={author.url}
            onChange={(event) =>
              onChange(
                authors.map((currentAuthor, currentIndex) =>
                  currentIndex === index
                    ? { ...currentAuthor, url: event.target.value }
                    : currentAuthor,
                ),
              )
            }
            placeholder='https://github.com/username'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            disabled={authors.length === 1}
            onClick={() => onChange(authors.toSpliced(index, 1))}
            aria-label='Remove author'
            className='text-muted-foreground hover:text-destructive'
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        onClick={() => onChange([...authors, { name: '', url: '' }])}
        className='mt-1 w-full border-dashed'
      >
        <PlusIcon data-icon='inline-start' />
        Add author
      </Button>
      {error && <p className='text-destructive text-xs'>{error}</p>}
    </div>
  );
}
