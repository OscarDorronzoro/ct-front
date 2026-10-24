import { Spinner } from '@/shared/ui/spinner';

// While the code of a lazy route loads on the first page load (the zone editor, the explorer)
export default function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    >
      <Spinner size={32} />
    </div>
  );
}
