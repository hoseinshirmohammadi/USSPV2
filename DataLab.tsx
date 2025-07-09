
import React, { useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { DATA_LAB_ICON, AI_ASSISTANT_ICON } from '../constants';

// Header component
const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 mt-2">{subtitle}</p>
    </div>
);

// Sample Data
const sampleCsvData = `City,Population,GreenSpace_sqkm,AvgCommuteTime_min,PublicTransportUsage_pct
Tehran,8693706,21.5,55.3,45.2
Isfahan,1961260,18.2,38.1,35.8
Shiraz,1565572,22.8,35.5,33.1
Mashhad,3001184,15.6,48.9,40.5
Tabriz,1558693,12.1,42.7,30.9
`;

interface Stat {
    column: string;
    mean: number;
    median: number;
    std_dev: number;
}

interface ColumnType {
    column: string;
    type: string;
}

interface AnalysisResult {
    summary: string;
    descriptive_statistics: Stat[];
    column_types: ColumnType[];
    research_questions: string[];
}

const DataLab: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [csvContent, setCsvContent] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const handleAnalysis = useCallback(async () => {
        if (!csvContent) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const schema = {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the dataset's content and potential focus." },
            descriptive_statistics: {
              type: Type.ARRAY,
              description: "Descriptive statistics for each numerical column.",
              items: {
                type: Type.OBJECT,
                properties: {
                  column: { type: Type.STRING },
                  mean: { type: Type.NUMBER },
                  median: { type: Type.NUMBER },
                  std_dev: { type: Type.NUMBER }
                },
                required: ["column", "mean", "median", "std_dev"]
              }
            },
            column_types: {
              type: Type.ARRAY,
              description: "The detected data type for each column.",
              items: {
                type: Type.OBJECT,
                properties: {
                   column: { type: Type.STRING },
                   type: { type: Type.STRING, description: "e.g., Categorical, Numerical (Integer), Numerical (Float)" }
                },
                required: ["column", "type"]
              }
            },
            research_questions: {
              type: Type.ARRAY,
              description: "Three insightful research questions that could be investigated using this data.",
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "descriptive_statistics", "column_types", "research_questions"]
        };

        const prompt = `You are a data scientist specializing in urban studies. Your language is Persian. Analyze the following CSV data. Provide a summary, descriptive statistics for numerical columns, detect column types, and suggest three research questions. CSV data:\n\n${csvContent}`;

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
            setError("خطا در هنگام تحلیل داده‌ها. لطفا فرمت CSV را بررسی کرده و مجددا تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, csvContent]);

    useLayoutEffect(() => {
        setSidebarContent(null);
    }, [setSidebarContent]);
    
    const handleLoadSample = () => {
        setCsvContent(sampleCsvData);
        setAnalysisResult(null);
        setError(null);
    };

    return (
        <div className="page-container">
            <StaggeredGrid>
                <PageHeader title="آزمایشگاه تحلیل داده" subtitle="داده‌های خود را بارگذاری کرده و تحلیل‌های آماری و بصری انجام دهید." />
                
                <Card className="mb-8">
                     <textarea
                        value={csvContent}
                        onChange={(e) => setCsvContent(e.target.value)}
                        className="form-input w-full bg-slate-800/50 border-slate-700 font-mono text-sm"
                        placeholder="داده‌های خود را با فرمت CSV اینجا وارد کنید..."
                        rows={8}
                    />
                    <div className="mt-4 flex justify-end items-center gap-4">
                        <Button variant="ghost" onClick={handleLoadSample}>بارگذاری داده نمونه</Button>
                        <Button onClick={handleAnalysis} disabled={isLoading || !csvContent}>
                            {isLoading ? "در حال تحلیل..." : "شروع تحلیل"}
                        </Button>
                    </div>
                </Card>
                
                {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}

                {isLoading && (
                     <Card className="text-center py-24">
                        <Icon svg={AI_ASSISTANT_ICON} className="w-16 h-16 mx-auto text-primary animate-spin mb-4"/>
                        <p className="text-gray-400">هوش مصنوعی در حال تحلیل داده‌های شماست...</p>
                    </Card>
                )}

                {analysisResult && (
                    <div className="space-y-8">
                        <Card>
                            <h3 className="font-bold text-lg text-white mb-4">خلاصه تحلیل</h3>
                            <p className="text-gray-300 leading-relaxed">{analysisResult.summary}</p>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <h3 className="font-bold text-lg text-white mb-4">آمارهای توصیفی</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
                                            <tr>
                                                <th className="px-4 py-2">ستون</th>
                                                <th className="px-4 py-2 text-center">میانگین</th>
                                                <th className="px-4 py-2 text-center">میانه</th>
                                                <th className="px-4 py-2 text-center">انحراف معیار</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analysisResult.descriptive_statistics.map(stat => (
                                                <tr key={stat.column} className="border-b border-white/10">
                                                    <td className="px-4 py-2 font-medium text-white">{stat.column}</td>
                                                    <td className="px-4 py-2 text-center">{stat.mean.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-center">{stat.median.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-center">{stat.std_dev.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                             <Card>
                                <h3 className="font-bold text-lg text-white mb-4">نوع متغیرها</h3>
                                <ul className="space-y-2">
                                {analysisResult.column_types.map(ct => (
                                    <li key={ct.column} className="flex justify-between items-center bg-white/5 p-2 rounded-md">
                                        <span className="font-medium text-white">{ct.column}</span>
                                        <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full">{ct.type}</span>
                                    </li>
                                ))}
                                </ul>
                            </Card>
                        </div>
                         <Card>
                            <h3 className="font-bold text-lg text-white mb-4">سوالات پژوهشی پیشنهادی</h3>
                            <ul className="space-y-3 list-disc list-inside text-gray-300">
                                {analysisResult.research_questions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </Card>
                    </div>
                )}

                 {!isLoading && !analysisResult && !csvContent && (
                     <Card className="text-center py-24 border-dashed border-white/20">
                        <Icon svg={DATA_LAB_ICON} className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                        <h3 className="text-white font-bold text-xl">آزمایشگاه داده منتظر شماست</h3>
                        <p className="text-gray-400 text-sm mt-2">برای شروع، داده‌های خود را وارد کنید یا از نمونه استفاده نمایید.</p>
                    </Card>
                )}

            </StaggeredGrid>
        </div>
    );
};

export default DataLab;
