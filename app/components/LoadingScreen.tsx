// components/LoadingScreen.tsx
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-nora-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white font-bold text-2xl font-lastica">N</span>
        </div>
        <h2 className="text-2xl font-light text-white mb-4 font-lastica">
          NORA
        </h2>
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}