import { useState, type DragEvent } from 'react';
import { GripVerticalIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ModuleNamesFieldProps = {
  moduleNames: Record<string, string>;
  onChange: (moduleNames: Record<string, string>) => void;
};

export default function ModuleNamesField({ moduleNames, onChange }: ModuleNamesFieldProps) {
  const keys = Object.keys(moduleNames).sort((a, b) => Number(a) - Number(b));

  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  function handleDragOver(event: DragEvent<HTMLDivElement>, overKey: string) {
    event.preventDefault();
    if (overKey !== dragOverKey) setDragOverKey(overKey);
  }

  function handleDrop(targetKey: string) {
    if (draggingKey === null || draggingKey === targetKey) {
      setDraggingKey(null);
      setDragOverKey(null);
      return;
    }
    const fromIndex = keys.indexOf(draggingKey);
    const toIndex = keys.indexOf(targetKey);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingKey(null);
      setDragOverKey(null);
      return;
    }
    const reorderedKeys = [...keys];
    const [moved] = reorderedKeys.splice(fromIndex, 1);
    reorderedKeys.splice(toIndex, 0, moved);

    onChange(
      Object.fromEntries(reorderedKeys.map((key, index) => [String(index + 1), moduleNames[key]])),
    );
    setDraggingKey(null);
    setDragOverKey(null);
  }

  function handleDragEnd() {
    setDraggingKey(null);
    setDragOverKey(null);
  }

  return (
    <div className='grid gap-2'>
      {keys.map((key, index) => (
        <div
          key={key}
          onDragOver={(event) => handleDragOver(event, key)}
          onDrop={() => handleDrop(key)}
          className={cn(
            'grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg transition-colors',
            draggingKey === key && 'opacity-50',
            dragOverKey === key && draggingKey !== key && 'bg-muted',
          )}
        >
          <button
            type='button'
            draggable
            onDragStart={() => setDraggingKey(key)}
            onDragEnd={handleDragEnd}
            aria-label={`Reorder module ${index + 1}`}
            className='text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing'
          >
            <GripVerticalIcon className='size-4' />
          </button>
          <span className='bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-medium tabular-nums'>
            {index + 1}
          </span>
          <Input
            value={moduleNames[key]}
            onChange={(event) => onChange({ ...moduleNames, [key]: event.target.value })}
            placeholder='Module name'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => {
              const next = { ...moduleNames };
              delete next[key];
              onChange(
                Object.fromEntries(
                  Object.values(next).map((value, nextIndex) => [String(nextIndex + 1), value]),
                ),
              );
            }}
            aria-label={`Remove module ${index + 1}`}
            className='text-muted-foreground hover:text-destructive'
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        onClick={() =>
          onChange({ ...moduleNames, [String((Math.max(0, ...keys.map(Number)) || 0) + 1)]: '' })
        }
        className='mt-1 w-full border-dashed'
      >
        <PlusIcon data-icon='inline-start' />
        Add module
      </Button>
    </div>
  );
}
