
import React, { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { WRITING_CENTER_ICON, AI_ASSISTANT_ICON } from '../constants';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

const WritingCenterSidebar: React.FC<{ onGenerateAbstract: () => void; loading: boolean; }> = ({ onGenerateAbstract, loading }) => {
    return (
      <div className="space-y-6 p-2">
        <Card>
            <h3 className="font-bold text-white mb-3">ساختار علمی (IMRAD)</h3>
            <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between p-2 rounded-md bg-green-500/10 text-green-300"><span>مقدمه</span><span>✓</span></li>
                <li className="flex items-center justify-between p-2 rounded-md bg-green-500/10 text-green-300"><span>روش‌ها</span><span>✓</span></li>
                <li className="flex items-center justify-between p-2 rounded-md bg-yellow-500/10 text-yellow-300"><span>نتایج</span><span>!</span></li>
                <li className="flex items-center justify-between p-2 rounded-md bg-red-500/10 text-red-300"><span>بحث</span><span>✗</span></li>
            </ul>
        </Card>
        <Card>
             <h3 className="font-bold text-white mb-3">لحن علمی</h3>
             <div className="w-full bg-black/20 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full w-[85%]"></div>
            </div>
            <p className="text-xs text-center mt-2 text-gray-400">85% مطابق با لحن استاندارد</p>
        </Card>
        <Button onClick={onGenerateAbstract} icon={AI_ASSISTANT_ICON} className="w-full" disabled={loading}>
          {loading ? 'در حال تولید...' : 'تولید خودکار چکیده'}
        </Button>
      </div>
    );
};


const WritingCenter: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [text, setText] = useState('');
    const [abstract, setAbstract] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
    
    const handleGenerateAbstract = useCallback(async () => {
        if (!text) {
            setError("لطفا ابتدا متن اصلی مقاله را وارد کنید.");
            return;
        }
        setLoading(true);
        setError('');
        setAbstract('');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Please generate a concise, academic abstract in Persian for the following text:\n\n${text}`,
            });
            setAbstract(response.text);
        } catch (e) {
            console.error(e);
            setError("خطا در ارتباط با سرویس هوش مصنوعی. لطفا دوباره تلاش کنید.");
        } finally {
            setLoading(false);
        }
    }, [ai, text]);

    useLayoutEffect(() => {
        setSidebarContent(<WritingCenterSidebar onGenerateAbstract={handleGenerateAbstract} loading={loading} />);
        return () => setSidebarContent(null);
    }, [setSidebarContent, handleGenerateAbstract, loading]);

    return (
        <div className="page-container">
            <StaggeredGrid>
                <PageHeader title="مرکز نگارش علمی" subtitle="مقالات خود را با دستیار هوشمند ساختاریافته و حرفه‌ای بنویسید." />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="flex flex-col">
                        <h3 className="font-bold text-lg text-white mb-4">متن اصلی مقاله</h3>
                        <textarea 
                            className="form-input flex-grow w-full bg-transparent border-none focus:ring-0 p-0" 
                            placeholder="متن خود را اینجا وارد کنید..."
                            rows={20}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </Card>
                    <Card className="flex flex-col">
                        <h3 className="font-bold text-lg text-white mb-4">چکیده و کلمات کلیدی</h3>
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        {loading && (
                            <div className="flex items-center justify-center h-full">
                                <Icon svg={AI_ASSISTANT_ICON} className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        )}
                        {abstract && (
                            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{abstract}</div>
                        )}
                        {!loading && !abstract && (
                            <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                                <Icon svg={WRITING_CENTER_ICON} className="w-12 h-12 mx-auto mb-2" />
                                <p>چکیده تولید شده در اینجا نمایش داده می‌شود.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </StaggeredGrid>
        </div>
    );
};

export default WritingCenter;
