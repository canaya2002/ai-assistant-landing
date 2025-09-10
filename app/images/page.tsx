// app/images/page.tsx
import ProtectedRoute from '../components/ProtectedRoute';
import ImageGenerator from '../components/ImageGenerator';

export const metadata = {
  title: 'Generador de Imágenes - NORA AI',
  description: 'Genera imágenes increíbles con inteligencia artificial. Crea arte, fotografías y diseños únicos con NORA AI.',
  keywords: 'generador de imágenes, IA, arte artificial, crear imágenes, NORA AI',
  openGraph: {
    title: 'Generador de Imágenes - NORA AI',
    description: 'Genera imágenes increíbles con inteligencia artificial',
    type: 'website',
  },
};

export default function ImagesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        
        {/* Content */}
        <div className="relative z-10">
          <ImageGenerator />
        </div>
      </div>
    </ProtectedRoute>
  );
}