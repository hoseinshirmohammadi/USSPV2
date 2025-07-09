
import React, { useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { DIGITAL_LIBRARY_ICON, AI_ASSISTANT_ICON } from '../constants';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 mt-2">{subtitle}</p>
    </div>
);

const sampleText = `The integration of green infrastructure (GI) in urban planning has been identified as a critical strategy for enhancing urban resilience and sustainability. This study investigates the impact of GI on microclimate regulation and stormwater management in a densely populated metropolitan area. Using a combination of remote sensing data, in-situ measurements, and hydrological modeling, we analyzed the performance of various GI types, including green roofs, permeable pavements, and urban parks. Our findings indicate that green roofs can reduce surface temperatures by up to 15°C during peak summer days, while permeable pavements significantly decrease surface runoff by 60-80% during heavy rainfall events. The results demonstrate that a strategic network of GI can collectively mitigate the urban heat island effect and reduce the burden on conventional drainage systems, thereby contributing to more climate-adaptive cities.`;

interface AnalysisResult {
    summary: string;
    key_findings: string[];
    methodology: string;
    further_research_topics: string[];
}

const DigitalLibrary: React.FC = () => {
  const { setSidebarContent } = useLayout();
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  useLayoutEffect(() => {
    setSidebarContent(null);
  }, [setSidebarContent]);

  const handleAnalyze = useCallback(async () => {
    if (!text) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A concise, one-paragraph summary of the academic text." },
            key_findings: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "A bulleted list of the main conclusions or results from the text."
            },
            methodology: { type: Type.STRING, description: "A brief identification of the primary research methodology used (e.g., 'Quantitative analysis', 'Case study', 'Mixed-methods')." },
            further_research_topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three suggested topics for further research based on the text."
            }
        },
        required: ["summary", "key_findings", "methodology", "further_research_topics"]
    };

    const prompt = `You are a research assistant. Your language is Persian. Analyze the following academic text. Provide a summary, extract key findings, identify the methodology, and suggest three related research topics. Academic Text:\n\n${text}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonResponse = JSON.parse(response.text);
        setAnalysisResult(jsonResponse);
    } catch (e) {
        console.error(e);
        setError("خطا در هنگام تحلیل متن. لطفا دوباره تلاش کنید.");
    } finally {
        setIsLoading(false);
    }
  }, [ai, text]);

  return (
    <div className="page-container">
        <StaggeredGrid>
            <PageHeader title="کتابخانه دیجیتال هوشمند" subtitle="متون علمی خود را برای خلاصه‌سازی، استخراج نکات کلیدی و ایده‌پردازی وارد کنید." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="flex flex-col h-[70vh]">
                     <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="form-input flex-grow w-full bg-transparent border-none focus:ring-0 p-0"
                        placeholder="متن مقاله یا کتاب را اینجا وارد کنید..."
                    />
                     <div className="border-t border-white/10 p-4 flex justify-end items-center gap-4">
                        <Button variant="ghost" onClick={() => setText(sampleText)}>بارگذاری نمونه</Button>
                        <Button onClick={handleAnalyze} disabled={isLoading || !text}>
                            {isLoading ? "در حال تحلیل..." : "تحلیل متن"}
                        </Button>
                    </div>
                </Card>
                <div className="h-[70vh] overflow-y-auto">
                    <Card className="min-h-full">
                        {error && <p className="text-red-400 text-sm p-3 rounded-lg bg-red-500/10">{error}</p>}
                        
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Icon svg={AI_ASSISTANT_ICON} className="w-16 h-16 mx-auto text-primary animate-spin mb-4"/>
                                <p className="text-gray-400">هوش مصنوعی در حال مطالعه متن شماست...</p>
                            </div>
                        )}

                        {analysisResult && (
                            <div className="space-y-6 p-2">
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-2">خلاصه</h3>
                                    <p className="text-gray-300 leading-relaxed">{analysisResult.summary}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-2">یافته‌های کلیدی</h3>
                                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                                        {analysisResult.key_findings.map((finding, i) => <li key={i}>{finding}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-2">متدولوژی</h3>
                                    <p className="text-gray-300">{analysisResult.methodology}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-2">موضوعات پیشنهادی برای پژوهش آتی</h3>
                                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                                        {analysisResult.further_research_topics.map((topic, i) => <li key={i}>{topic}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {!isLoading && !analysisResult && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <Icon svg={DIGITAL_LIBRARY_ICON} className="w-20 h-20 mx-auto mb-4"/>
                                <h3 className="text-white font-bold text-xl">تحلیل‌گر متن شما</h3>
                                <p className="mt-2">نتایج تحلیل متن در اینجا نمایش داده خواهد شد.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

        </StaggeredGrid>
    </div>
  );
};

export default DigitalLibrary;
