import { StartButton } from '@/components/landing/StartButton';
import { Title } from '@/components/landing/Title';
import { IconCycle } from '@/components/landing/IconCycle';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-12 md:justify-center md:pt-0">
      <Title />
      <IconCycle />
      {/* <IconCycle / >currentIcon={0} /> */}
      <StartButton />
    </main>
  );
} 