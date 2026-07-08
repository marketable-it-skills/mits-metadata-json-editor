import { useState, type KeyboardEvent } from 'react';
import { ChevronDownIcon, PlusIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '../ui/button';

type TagInputFieldProps = {
  id: string;
  label: string;
  values: string[];
  placeholder: string;
  hint?: string;
  suggestions?: string[];
  /** Values that must always be present and cannot be removed (e.g. EN for languages). */
  lockedValues?: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
};

export default function TagInputField({
  id,
  label,
  values,
  placeholder,
  hint,
  suggestions,
  lockedValues = [],
  onAdd,
  onRemove,
}: TagInputFieldProps) {
  const [draft, setDraft] = useState('');

  const isLocked = (value: string) =>
    lockedValues.some((locked) => locked.toLowerCase() === value.toLowerCase());

  function addValue(raw: string) {
    const value = raw.trim();
    if (!value) return;
    if (values.some((existing) => existing.toLowerCase() === value.toLowerCase())) return;
    onAdd(value);
  }

  function removeValue(value: string) {
    if (isLocked(value)) return;
    onRemove(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addValue(draft);
      setDraft('');
    } else if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
  }

  const availableSuggestions = suggestions?.filter(
    (suggestion) => !values.some((value) => value.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <div className='grid gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <div className='border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors focus-within:ring-3'>
        {values.map((value) =>
          isLocked(value) ? (
            <Badge
              key={value}
              variant='secondary'
              title={`${value} is required and cannot be removed`}
            >
              {value}
            </Badge>
          ) : (
            <Badge
              key={value}
              variant='secondary'
              className='gap-1 pr-1'
            >
              {value}
              <button
                type='button'
                aria-label={`Remove ${value}`}
                onClick={() => removeValue(value)}
                className='hover:bg-foreground/10 rounded-full p-0.5 transition-colors'
              >
                <XIcon className='size-3' />
              </button>
            </Badge>
          ),
        )}
        <input
          id={id}
          type='text'
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            addValue(draft);
            setDraft('');
          }}
          className='placeholder:text-muted-foreground h-6 min-w-28 flex-1 bg-transparent px-1 text-sm outline-none'
        />
        <Button
          type='button'
          variant='default'
          size='icon'
          onClick={() => {
            addValue(draft);
            setDraft('');
          }}
          aria-label='Add value'
        >
          <PlusIcon className='size-4' />
        </Button>
      </div>
      {hint && <p className='text-muted-foreground text-xs'>{hint}</p>}
      {availableSuggestions && availableSuggestions.length > 0 && (
        <details className='group border-border mt-1 rounded-lg border border-dashed px-2 py-1.5'>
          <summary className='text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1.5 text-xs outline-none [&::-webkit-details-marker]:hidden'>
            <ChevronDownIcon className='size-3.5 transition-transform group-open:rotate-180' />
            Suggestions ({availableSuggestions.length})
          </summary>
          <div className='mt-2 flex flex-wrap items-center gap-1.5'>
            {availableSuggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                asChild
                variant='outline'
                className='h-6 px-2.5 py-1'
              >
                <button
                  type='button'
                  onClick={() => addValue(suggestion)}
                  className='hover:bg-muted cursor-pointer transition-colors'
                >
                  <PlusIcon />
                  {suggestion}
                </button>
              </Badge>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
