
import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { IMAGE_ICON, DOWNLOAD_ICON, DELETE_ICON } from '../constants';
import { useLayout } from '../hooks/useLayout';
import { Icon } from '../components/atoms/Icon';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

// Sidebar component with state management
const ImageGenerationSidebar: React.FC<{ 
    onGenerate: (prompt: string, aspectRatio: string, style: string) => void,
    loading: boolean
}> = ({ onGenerate, loading }) => {
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic green city with flying vehicles, inspired by Zaha Hadid architecture.');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [style, setStyle] = useState('photorealism');
    
    const handleGenerateClick = () => {
        onGenerate(prompt, aspectRatio, style);
    }
    
    return (
      <div className="space-y-6 p-2">
        <div>
            <label htmlFor="prompt" className="form-label">پرامپت (دستور)</label>
            <textarea id="prompt" rows={5} className="form-input" placeholder="مثال: یک شهر آینده‌نگر در زیر اقیانوس..." value={prompt} onChange={e => setPrompt(e.target.value)}></textarea>
        </div>
        <div>
            <label className="form-label">نسبت تصویر</label>
            <div className="grid grid-cols-3 gap-2">
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                    <button 
                        key={ratio} 
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2 py-1.5 text-xs rounded-md transition-colors focus:outline-none focus-visible:ring-2 ring-primary ${aspectRatio === ratio ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        {ratio}
                    </button>
                ))}
            </div>
        </div>
        <div>
            <label className="form-label">سبک</label>
            <select className="form-input" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="photorealism">فتورئالیسم</option>
                <option value="cinematic">سینمایی</option>
                <option value="anime">انیمه</option>
                <option value="digital art">هنر دیجیتال</option>
                <option value="watercolor">آبرنگ</option>
            </select>
        </div>
        <Button onClick={handleGenerateClick} icon={IMAGE_ICON} className="w-full" disabled={loading}>
          {loading ? 'در حال تولید...' : 'تولید تصویر'}
        </Button>
      </div>
    );
};

interface GeneratedImage {
    id: string;
    src: string;
    prompt: string;
}

const ImageCard: React.FC<{ image: GeneratedImage, isLoading: boolean, onDelete: (id: string) => void }> = ({ image, isLoading, onDelete }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.src;
        link.download = `generated-image-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
    <Card className={`aspect-square relative overflow-hidden group ${isLoading ? 'animate-pulse bg-white/5' : 'glow-border'}`} padding="p-0">
        {!isLoading ? (
            <>
                <img src={image.src} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-xs text-white mb-2 line-clamp-2">{image.prompt}</p>
                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                        <Button size="sm" variant="secondary" onClick={handleDownload}><Icon svg={DOWNLOAD_ICON} className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="bg-red-500/20 hover:bg-red-500/50" onClick={() => onDelete(image.id)}><Icon svg={DELETE_ICON} className="w-4 h-4" /></Button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex items-center justify-center h-full">
                <Icon svg={IMAGE_ICON} className="w-10 h-10 text-primary animate-pulse"/>
            </div>
        )}
    </Card>
    )
};

const ImageGeneration: React.FC = () => {
  const { setSidebarContent } = useLayout();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const handleGenerate = useCallback(async (prompt: string, aspectRatio: string, style: string) => {
      setIsLoading(true);
      setError('');
      
      const fullPrompt = `${prompt}, ${style} style`;
      
      try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        
        const newImage: GeneratedImage = {
            id: new Date().toISOString(),
            src: imageUrl,
            prompt: prompt,
        };
        setImages(prev => [newImage, ...prev]);

      } catch (e) {
        console.error(e);
        setError("خطا در تولید تصویر. لطفا دوباره تلاش کنید. ممکن است پرامپت شما با سیاست‌های ایمنی مغایرت داشته باشد.");
      } finally {
        setIsLoading(false);
      }
  }, [ai]);

  const handleDelete = (id: string) => {
      setImages(prev => prev.filter(img => img.id !== id));
  };

  useLayoutEffect(() => {
    setSidebarContent(<ImageGenerationSidebar onGenerate={handleGenerate} loading={isLoading} />);
    return () => setSidebarContent(null);
  }, [setSidebarContent, handleGenerate, isLoading]);


  return (
    <div className="page-container">
      <PageHeader title="تولید تصویر با هوش مصنوعی" subtitle="ایده‌های خود را به تصاویر خارق‌العاده تبدیل کنید." />
      
      {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
      
      <h3 className="font-bold text-white mb-4">گالری شما</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading && <ImageCard image={{id: '', src: '', prompt: ''}} isLoading={true} onDelete={()=>{}} />}
        {images.map((img) => <ImageCard key={img.id} image={img} isLoading={false} onDelete={handleDelete} />)}
      </div>

       {images.length === 0 && !isLoading && (
        <Card className="text-center py-16 border-dashed border-white/20">
            <Icon svg={IMAGE_ICON} className="w-12 h-12 mx-auto text-gray-500 mb-4"/>
            <h3 className="text-white font-bold">گالری شما خالی است</h3>
            <p className="text-gray-400 text-sm mt-2">از پنل کناری برای ساخت اولین تصویر خود استفاده کنید.</p>
        </Card>
      )}

    </div>
  );
};
export default ImageGeneration;
