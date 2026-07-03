import { MoonIcon, SunIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMetadata } from '@/components/providers/metadata-provider';
import { Button } from '@/components/ui/button';
import mitsLogoDark from '@/assets/images/mits-logo-dark.svg';
import mitsLogoLight from '@/assets/images/mits-logo-light.svg';
import { useTheme } from './providers/theme-provider';

const navItems = [
  { label: 'Project Tasks', mode: 'project-task' as const },
  { label: 'Tutorials', mode: 'tutorial' as const },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { metadata, dispatchMetadata } = useMetadata();

  return (
    <header className='bg-card fixed inset-x-0 top-0 z-50 border-b'>
      <div className='mx-auto flex h-14 w-full max-w-5xl items-center gap-8 px-4'>
        <div className='flex shrink-0 items-center gap-3'>
          <img
            src={theme === 'light' ? mitsLogoLight : mitsLogoDark}
            alt='MITS logo'
            className='size-8'
          />
          <div className='flex items-baseline gap-2'>
            <span className='font-semibold'>MITS</span>
            <span className='text-muted-foreground text-sm'>Metadata Editor</span>
          </div>
        </div>

        <nav className='hidden h-14 items-stretch gap-6 sm:flex'>
          {navItems.map((item) => {
            const active = metadata.mode === item.mode;
            return (
              <button
                key={item.mode}
                type='button'
                onClick={() => dispatchMetadata({ type: 'setMode', payload: item.mode })}
                className={cn(
                  'relative flex items-center text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground after:bg-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Toggle theme'
          className='ml-auto'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'light' ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
    </header>
  );
}
