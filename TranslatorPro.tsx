
import React, { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { TRANSLATE_ICON, TRANSLATOR_PRO_ICON } from '../constants';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

const TranslatorSidebar: React.FC<{ onTranslate: () => void; loading: boolean, setMode: (mode: string) => void }> = ({ onTranslate, loading, setMode }) => {
    return (
      <div className="space-y-6 p-2">
        <div>
          <label className="form-label">حالت ترجمه</label>
          <select className="form-input" onChange={(e) => setMode(e.target.value)}>
            <option value="default">دقیق و سریع</option>
            <option value="scientific">علمی</option>
            <option value="research">پژوهشی</option>
          </select>
        </div>
        <Button onClick={onTranslate} icon={TRANSLATE_ICON} className="w-full" disabled={loading}>
          {loading ? 'در حال ترجمه...' : 'ترجمه کن'}
        </Button>
      </div>
    );
};

const TranslatorPro: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const handleTranslate = useCallback(async () => {
        if (!inputText) return;
        setLoading(true);
        setError('');
        setOutputText('');

        const prompts = {
            default: `Translate the following text to Persian accurately:`,
            scientific: `Translate the following text to academic Persian, maintaining a formal and scientific tone:`,
            research: `Translate the following text to Persian for a research paper, paying close attention to technical terminology:`
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${prompts[mode]}\n\n${inputText}`,
            });
            setOutputText(response.text);
        } catch (e) {
            console.error(e);
            setError("خطا در ارتباط با سرویس هوش مصنوعی. لطفا دوباره تلاش کنید.");
        } finally {
            setLoading(false);
        }
    }, [ai, inputText, mode]);

    useLayoutEffect(() => {
        setSidebarContent(<TranslatorSidebar onTranslate={handleTranslate} loading={loading} setMode={setMode} />);
        return () => setSidebarContent(null);
    }, [setSidebarContent, handleTranslate, loading, setMode]);

    return (
        <div className="page-container">
            <StaggeredGrid>
                <PageHeader title="مترجم تخصصی" subtitle="متون خود را با دقت و در زمینه‌های مختلف علمی و پژوهشی ترجمه کنید." />
                
                {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-18rem)]">
                    <Card className="flex flex-col">
                        <h3 className="font-bold text-lg text-white mb-4">متن مبدا (انگلیسی)</h3>
                        <textarea 
                            className="form-input flex-grow w-full bg-transparent border-none focus:ring-0 p-0" 
                            placeholder="متن انگلیسی را اینجا وارد کنید..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </Card>
                    <Card className="flex flex-col">
                        <h3 className="font-bold text-lg text-white mb-4">ترجمه (فارسی)</h3>
                        <div className="flex-grow w-full text-gray-300 whitespace-pre-wrap">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Icon svg={TRANSLATOR_PRO_ICON} className="w-10 h-10 text-primary animate-pulse" />
                                </div>
                            ) : outputText ? (
                                outputText
                            ) : (
                                <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                                    <Icon svg={TRANSLATOR_PRO_ICON} className="w-12 h-12 mx-auto mb-2" />
                                    <p>ترجمه شما در اینجا نمایش داده می‌شود.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </StaggeredGrid>
        </div>
    );
};

export default TranslatorPro;
