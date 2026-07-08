import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClipboardCopyIcon,
  ClipboardPasteIcon,
  DownloadIcon,
  FileUpIcon,
  RotateCcwIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillDomains } from '@/lib/data';
import { toExportJson } from '@/lib/metadata';
import { metadataSchema, validateImportShape } from '@/lib/validate-metadata';
import { useMetadata } from '@/components/providers/metadata-provider';
import { TechTagContext } from '@/components/providers/tech-tag-provider';
import { useSuggestions } from '@/hooks/use-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Metadata } from '@/types';
import AuthorsField from './authors-field';
import ModuleNamesField from './module-names-field';
import TagInputField from './tag-input-field';

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className='grid gap-5'>
      <div className='grid gap-1'>
        <h2 className='text-sm font-semibold'>{title}</h2>
        {description && <p className='text-muted-foreground text-xs'>{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className='grid gap-2'>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className='text-destructive'>*</span>}
      </Label>
      {children}
      {error ? (
        <p className='text-destructive text-xs'>{error}</p>
      ) : (
        hint && <p className='text-muted-foreground text-xs'>{hint}</p>
      )}
    </div>
  );
}

export default function MetadataForm() {
  const { metadata, dispatchMetadata } = useMetadata();
  const { setTags, setTechnologies } = useContext(TechTagContext);
  const { technologySuggestions, tagSuggestions } = useSuggestions();
  const isProjectTask = metadata.mode === 'project-task';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const [forceRefresh, setForceRefresh] = useState(0);

  const {
    control,
    getValues,
    register,
    trigger,
    formState: { errors, isValid },
  } = useForm<Metadata>({
    values: metadata,
    resolver: zodResolver(metadataSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    void trigger();
  }, [metadata, trigger]);

  function applyImportedJson(data: unknown) {
    const shapeError = validateImportShape(data);
    if (shapeError) {
      setImportError(shapeError);
      return;
    }
    setImportError(null);
    dispatchMetadata({ type: 'import', payload: data });
    setForceRefresh((prev) => prev + 1);
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        applyImportedJson(JSON.parse(reader.result as string));
      } catch {
        setImportError('The selected file is not valid JSON.');
      }
    };
    reader.readAsText(file);
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      applyImportedJson(JSON.parse(text));
    } catch {
      setImportError('Clipboard content is not valid JSON.');
    }
  }

  function handleExportFile() {
    const json = JSON.stringify(toExportJson(getValues()), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${getValues().name || 'metadata'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyToClipboard() {
    const json = JSON.stringify(toExportJson(getValues()), null, 2);
    await navigator.clipboard.writeText(json);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  }

  return (
    <Card
      className='mx-auto w-full max-w-3xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'
      key={forceRefresh}
    >
      <CardContent className='grid gap-8 sm:gap-10'>
        <Tabs
          value={metadata.mode}
          onValueChange={(value) => {
            dispatchMetadata({ type: 'setMode', payload: value });
            setForceRefresh((prev) => prev + 1);
          }}
        >
          <TabsList className='w-full'>
            <TabsTrigger
              value='project-task'
              className='py-4'
            >
              Project Task
            </TabsTrigger>
            <TabsTrigger
              value='tutorial'
              className='py-4'
            >
              Tutorial
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <FormSection
          title='Task identity'
          description={
            isProjectTask
              ? 'The internal task name is generated from the fields below.'
              : 'Give the tutorial a name and a public-facing display title.'
          }
        >
          {isProjectTask && (
            <>
              <Field
                label='Competition'
                htmlFor='competition'
                required
                error={errors.competition?.message}
              >
                <Input
                  id='competition'
                  {...register('competition', {
                    onChange: (event) =>
                      dispatchMetadata({
                        type: 'set',
                        payload: { field: 'competition', value: event.target.value },
                      }),
                  })}
                  aria-invalid={!!errors.competition}
                  placeholder='e.g. EuroSkills 2027 HU National Final'
                />
              </Field>
              <div className='grid gap-5 sm:grid-cols-2'>
                <Field
                  label='Competition short name'
                  htmlFor='competition-short-name'
                  required
                  error={errors.competitionShortName?.message}
                >
                  <Input
                    id='competition-short-name'
                    {...register('competitionShortName', {
                      onChange: (event) =>
                        dispatchMetadata({
                          type: 'set',
                          payload: { field: 'competitionShortName', value: event.target.value },
                        }),
                    })}
                    aria-invalid={!!errors.competitionShortName}
                    placeholder='e.g. ES2027'
                  />
                </Field>
                <Field
                  label='Module name'
                  htmlFor='module-name'
                  required
                  error={errors.moduleName?.message}
                >
                  <Input
                    id='module-name'
                    {...register('moduleName', {
                      onChange: (event) =>
                        dispatchMetadata({
                          type: 'set',
                          payload: { field: 'moduleName', value: event.target.value },
                        }),
                    })}
                    aria-invalid={!!errors.moduleName}
                    placeholder='e.g. Module C'
                  />
                </Field>
              </div>
            </>
          )}

          {isProjectTask ? (
            <Field
              label='Name'
              htmlFor='name'
              hint='Auto-generated from competition short name, skill and module name.'
            >
              <div className='relative'>
                <Input
                  id='name'
                  readOnly
                  tabIndex={-1}
                  value={metadata.name}
                  placeholder='ES2027 S17 Module C'
                  className='text-muted-foreground pr-9'
                />
                <WandSparklesIcon className='text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2' />
              </div>
            </Field>
          ) : (
            <Field
              label='Name'
              htmlFor='name'
              required
              error={errors.name?.message}
              hint='Internal identifier for the tutorial.'
            >
              <Input
                id='name'
                {...register('name', {
                  onChange: (event) =>
                    dispatchMetadata({
                      type: 'set',
                      payload: { field: 'name', value: event.target.value },
                    }),
                })}
                aria-invalid={!!errors.name}
                placeholder='e.g. Design Implementation Tutorial'
              />
            </Field>
          )}
        </FormSection>

        <Separator />

        <FormSection
          title='Task details'
          description='Provide a short description and summary of the task. (optional)'
        >
          <Field
            label='Task topic'
            htmlFor='task-topic'
            error={errors.displayName?.message}
          >
            <Input
              id='task-topic'
              {...register('displayName', {
                onChange: (event) =>
                  dispatchMetadata({
                    type: 'set',
                    payload: { field: 'displayName', value: event.target.value },
                  }),
              })}
              aria-invalid={!!errors.displayName}
              placeholder='Short description of the task topic'
            />
          </Field>
          <Field
            label='Description'
            htmlFor='description'
            error={errors.description?.message}
          >
            <Textarea
              id='description'
              {...register('description', {
                onChange: (event) =>
                  dispatchMetadata({
                    type: 'set',
                    payload: { field: 'description', value: event.target.value },
                  }),
              })}
              aria-invalid={!!errors.description}
              placeholder='Summary of the task…'
              className='min-h-28'
            />
          </Field>
        </FormSection>

        <Separator />

        <FormSection title='Classification'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Controller
              control={control}
              name='skillDomainIds'
              render={({ field }) => (
                <Field
                  label='Skill'
                  htmlFor='skill'
                  hint='Select the skill domain that best fits the task.'
                  required
                >
                  <Select
                    value={String(field.value?.[0] ?? '')}
                    onValueChange={(value) => {
                      const nextSkill = Number(value);
                      field.onChange([nextSkill]);
                      dispatchMetadata({
                        type: 'set',
                        payload: { field: 'skill', value: nextSkill },
                      });
                    }}
                  >
                    <SelectTrigger
                      id='skill'
                      className='w-full'
                    >
                      <SelectValue placeholder='Select a skill domain' />
                    </SelectTrigger>
                    <SelectContent>
                      {skillDomains.map((domain) => (
                        <SelectItem
                          key={domain.id}
                          value={String(domain.id)}
                        >
                          {domain.name} ({domain.wsId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            {isProjectTask && (
              <Field
                label='Estimated time'
                htmlFor='est-time'
                hint='Expected completion time.'
                required
                error={errors.estTime?.message}
              >
                <div className='relative'>
                  <Input
                    id='est-time'
                    type='number'
                    min={1}
                    {...register('estTime', {
                      valueAsNumber: true,
                      onChange: (event) =>
                        dispatchMetadata({
                          type: 'set',
                          payload: { field: 'estTime', value: Number(event.target.value) },
                        }),
                    })}
                    aria-invalid={!!errors.estTime}
                    className='pr-14'
                  />
                  <span className='text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm'>
                    hours
                  </span>
                </div>
              </Field>
            )}
          </div>
          <Controller
            control={control}
            name='languages'
            render={({ field }) => (
              <TagInputField
                id='languages'
                label='Languages'
                values={field.value}
                lockedValues={['EN']}
                placeholder='Add language…'
                hint='ISO language codes, e.g. EN, HU. English is always required.'
                onAdd={(value) => {
                  const next = [...field.value, value];
                  field.onChange(next);
                  dispatchMetadata({ type: 'setLanguages', payload: next });
                }}
                onRemove={(value) => {
                  const next = field.value.filter((entry) => entry !== value);
                  field.onChange(next);
                  dispatchMetadata({ type: 'setLanguages', payload: next });
                }}
              />
            )}
          />
        </FormSection>

        <Separator />

        <FormSection
          title='Authors'
          description='At least one author is required.'
        >
          <Controller
            control={control}
            name='authors'
            render={({ field }) => (
              <AuthorsField
                authors={field.value}
                error={errors.authors?.message}
                urlErrors={
                  Array.isArray(errors.authors)
                    ? errors.authors.map((authorError) => authorError?.url?.message)
                    : undefined
                }
                onChange={(nextAuthors) => {
                  field.onChange(nextAuthors);
                  dispatchMetadata({ type: 'setAuthors', payload: nextAuthors });
                }}
              />
            )}
          />
        </FormSection>

        <Separator />

        <FormSection
          title='Technologies & tags'
          description='Pick from catalog suggestions or add custom values — they are remembered for future visits.'
        >
          <Controller
            control={control}
            name='technologies'
            render={({ field }) => (
              <TagInputField
                id='technologies'
                label='Technologies'
                values={field.value}
                placeholder='Add technology…'
                suggestions={technologySuggestions}
                onAdd={(value) => {
                  const next = field.value.some(
                    (entry) => entry.toLowerCase() === value.toLowerCase(),
                  )
                    ? field.value
                    : [...field.value, value];
                  field.onChange(next);
                  dispatchMetadata({ type: 'setTechnologies', payload: next });
                  setTechnologies((current = []) =>
                    current.some((entry) => entry.toLowerCase() === value.toLowerCase())
                      ? current
                      : [...current, value],
                  );
                }}
                onRemove={(value) => {
                  const next = field.value.filter((entry) => entry !== value);
                  field.onChange(next);
                  dispatchMetadata({ type: 'setTechnologies', payload: next });
                }}
              />
            )}
          />
          <Controller
            control={control}
            name='tags'
            render={({ field }) => (
              <TagInputField
                id='tags'
                label='Tags'
                values={field.value}
                placeholder='Add tag…'
                suggestions={tagSuggestions}
                onAdd={(value) => {
                  const next = field.value.some(
                    (entry) => entry.toLowerCase() === value.toLowerCase(),
                  )
                    ? field.value
                    : [...field.value, value];
                  field.onChange(next);
                  dispatchMetadata({ type: 'setTags', payload: next });
                  setTags((current = []) =>
                    current.some((entry) => entry.toLowerCase() === value.toLowerCase())
                      ? current
                      : [...current, value],
                  );
                }}
                onRemove={(value) => {
                  const next = field.value.filter((entry) => entry !== value);
                  field.onChange(next);
                  dispatchMetadata({ type: 'setTags', payload: next });
                }}
              />
            )}
          />
        </FormSection>

        {!isProjectTask && (
          <>
            <Separator />
            <FormSection
              title='Modules'
              description='Ordered list of tutorial modules. The key is the module number.'
            >
              <Controller
                control={control}
                name='moduleNames'
                render={({ field }) => (
                  <ModuleNamesField
                    moduleNames={field.value ?? {}}
                    onChange={(nextModuleNames) => {
                      field.onChange(nextModuleNames);
                      dispatchMetadata({ type: 'setModuleNames', payload: nextModuleNames });
                    }}
                  />
                )}
              />
            </FormSection>
          </>
        )}
      </CardContent>

      <CardFooter className='flex-col items-stretch gap-3'>
        <input
          ref={fileInputRef}
          type='file'
          accept='application/json'
          onChange={handleFileSelected}
          className='hidden'
        />

        {importError && (
          <div className='border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-xs'>
            <AlertCircleIcon className='size-4 shrink-0' />
            {importError}
          </div>
        )}

        {!isValid && (
          <div className='border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-xs'>
            <AlertCircleIcon className='size-4 shrink-0' />
            Fix {Object.keys(errors).length} field{Object.keys(errors).length === 1 ? '' : 's'}{' '}
            before exporting.
          </div>
        )}

        <div className='grid gap-3 sm:grid-cols-2'>
          <Button
            type='button'
            size='lg'
            disabled={!isValid}
            onClick={handleExportFile}
          >
            <DownloadIcon data-icon='inline-start' />
            Export JSON
          </Button>
          <Button
            type='button'
            size='lg'
            variant='secondary'
            disabled={!isValid}
            onClick={handleCopyToClipboard}
          >
            <ClipboardCopyIcon data-icon='inline-start' />
            {copyStatus === 'copied' ? 'Copied!' : 'Copy to clipboard'}
          </Button>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <Button
            type='button'
            size='lg'
            variant='outline'
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUpIcon data-icon='inline-start' />
            Import from file
          </Button>
          <Button
            type='button'
            size='lg'
            variant='outline'
            onClick={handlePasteFromClipboard}
          >
            <ClipboardPasteIcon data-icon='inline-start' />
            Paste from clipboard
          </Button>
        </div>
        <Button
          type='button'
          size='lg'
          variant='destructive'
          onClick={() => {
            dispatchMetadata({ type: 'reset' });
            setForceRefresh((prev) => prev + 1);
          }}
        >
          <RotateCcwIcon data-icon='inline-start' />
          Reset to default template
        </Button>
        <p className='text-muted-foreground mt-1 flex items-center justify-center gap-1.5 text-center text-xs'>
          <CheckCircle2Icon className='size-3.5' />
          Changes are saved automatically to your browser.
        </p>
      </CardFooter>
    </Card>
  );
}
