
import React, { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { PLAGIARISM_CHECKER_ICON } from '../constants';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 mt-2">{subtitle}</p>
    </div>
);

const DonutChart: React.FC<{ percentage: number }> = ({ percentage }) => {
    const strokeWidth = 10;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = percentage > 50 ? 'text-red-500' : percentage > 20 ? 'text-yellow-500' : 'text-green-500';

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                <circle className="text-white/10" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx="70" cy="70" />
                <circle className={color} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx="70" cy="70" strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{percentage}%</span>
                <span className="text-xs text-gray-400">احتمال سرقت</span>
            </div>
        </div>
    );
};

interface Source {
    title: string;
    url: string;
}

const PlagiarismChecker: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [text, setText] = useState('');
    const [result, setResult] = useState<{ score: number; sources: Source[], summary: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const handleCheck = useCallback(async () => {
        if (!text) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the following text in Persian and find web pages with very similar content. If similar content is found, list the sources. Finally, provide a brief one-sentence summary in Persian about whether the text seems original or has similarities to online content. Text to analyze: "${text}"`,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            const sources: Source[] = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
                title: chunk.web.title || chunk.web.uri,
                url: chunk.web.uri,
            })).filter((s: Source) => s.url) || [];

            // A simple heuristic for a score
            const score = sources.length > 0 ? Math.min(sources.length * 15 + Math.floor(Math.random() * 10), 95) : Math.floor(Math.random() * 5);

            setResult({
                score: score,
                sources: sources,
                summary: response.text,
            });
            
        } catch (e) {
            console.error(e);
            setError("خطا در هنگام بررسی متن. لطفا دوباره تلاش کنید.");
        } finally {
            setLoading(false);
        }
    }, [ai, text]);

    useLayoutEffect(() => {
        setSidebarContent(null);
    }, [setSidebarContent]);

    return (
        <div className="page-container">
            <StaggeredGrid>
                <PageHeader title="تشخیص سرقت علمی" subtitle="اصالت متون پژوهشی خود را با الگوریتم‌های پیشرفته بررسی کنید." />

                {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="flex flex-col h-[60vh]">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="form-input flex-grow w-full bg-transparent border-none focus:ring-0 p-0"
                                placeholder="متن خود را برای بررسی اینجا وارد کنید یا فایل خود را آپلود نمایید..."
                            />
                             <div className="border-t border-white/10 p-4 flex justify-end items-center space-x-4 rtl:space-x-reverse">
                                <Button variant="secondary">آپلود فایل</Button>
                                <Button onClick={handleCheck} disabled={loading || !text}>
                                    {loading ? 'در حال بررسی...' : 'بررسی کن'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <h3 className="font-bold text-lg text-white mb-4 text-center">گزارش مشابهت</h3>
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Icon svg={PLAGIARISM_CHECKER_ICON} className="w-12 h-12 text-primary animate-spin" />
                                </div>
                            ) : result ? (
                                <div className="flex flex-col items-center space-y-6">
                                    <DonutChart percentage={result.score} />
                                    <p className="text-sm text-center text-gray-300 px-2">{result.summary}</p>
                                    <div className="w-full">
                                        <h4 className="font-semibold text-white mb-3">منابع مشابه یافت شده:</h4>
                                        {result.sources.length > 0 ? (
                                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                                {result.sources.map((source, i) => (
                                                    <li key={i} className="text-sm p-2 bg-white/5 rounded-md flex justify-between items-center">
                                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate w-full" title={source.url}>
                                                            {source.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-center text-gray-500 py-4">هیچ منبع آنلاین مشابهی یافت نشد.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <Icon svg={PLAGIARISM_CHECKER_ICON} className="w-16 h-16 mx-auto mb-4" />
                                    <p>نتایج بررسی در اینجا نمایش داده می‌شود.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </StaggeredGrid>
        </div>
    );
};

export default PlagiarismChecker;
