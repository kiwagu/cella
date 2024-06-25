import { Loader2 } from 'lucide-react';
import useMounted from '~/hooks/use-mounted';

const Spinner = () => {
  const { hasStarted } = useMounted();

  return (
    <div className={`duration-300 transition-all ${!hasStarted && 'opacity-0'} `}>
      <Loader2 className="text-muted-foreground mx-auto mt-[40vh] h-10 w-10 animate-spin" />
    </div>
  );
};

export default Spinner;