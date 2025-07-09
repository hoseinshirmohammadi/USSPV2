
import React, { useState, useLayoutEffect } from 'react';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { VIDEO_ICON, MOCK_VIDEOS_DATA } from '../constants';
import { useLayout } from '../hooks/useLayout';
import { Icon } from '../components/atoms/Icon';
import { VideoType } from '../types';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

const VideoGenerationSidebar: React.FC<{}> = () => {
    return (
      <div className="space-y-6 p-2">
        <div>
            <label htmlFor="prompt" className="form-label">پرامپت (دستور)</label>
            <textarea id="prompt" rows={5} className="form-input" placeholder="مثال: یک ربات کوچک در حال گشت و گذار در یک جنگل سرسبز..." disabled></textarea>
        </div>
        <div>
            <label htmlFor="duration" className="form-label">مدت زمان (ثانیه)</label>
            <input type="number" id="duration" className="form-input" defaultValue={4} disabled />
        </div>
        <div>
            <label htmlFor="motion" className="form-label">سطح حرکت</label>
            <input type="range" id="motion" min="1" max="10" defaultValue="5" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb" disabled />
        </div>
        <Button icon={VIDEO_ICON} className="w-full" disabled={true}>
          به زودی...
        </Button>
         <p className="text-xs text-center text-gray-500">قابلیت تولید ویدیو در حال حاضر در مرحله آزمایشی بوده و به زودی در دسترس قرار خواهد گرفت.</p>
      </div>
    );
};

const VideoCard: React.FC<{ video: VideoType }> = ({ video }) => (
    <Card className="aspect-video relative overflow-hidden group" padding="p-0">
        <img src={video.thumbnailUrl} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/50 opacity-100 flex items-center justify-center space-x-2">
            <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">نمونه نمایشی</span>
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <Icon svg={VIDEO_ICON} className="w-3 h-3 inline me-1" /> 0:04
        </div>
    </Card>
);

const VideoGeneration: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [videos] = useState<VideoType[]>(MOCK_VIDEOS_DATA);
  
    useLayoutEffect(() => {
      setSidebarContent(<VideoGenerationSidebar />);
      return () => setSidebarContent(null);
    }, [setSidebarContent]);

    return (
        <div className="page-container">
            <PageHeader title="تولید ویدیو با هوش مصنوعی" subtitle="این قابلیت به زودی در دسترس قرار خواهد گرفت. در زیر نمونه‌های نمایشی را مشاهده می‌کنید." />
            
            <h3 className="font-bold text-white mb-4">گالری نمونه</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((vid) => <VideoCard key={vid.id} video={vid} />)}
            </div>
    
        </div>
    );
};
export default VideoGeneration;