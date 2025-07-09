
import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { TERMINOLOGY_BOOK_ICON, SEARCH_ICON, AI_ASSISTANT_ICON } from '../constants';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

// New Sidebar Component
const TerminologySidebar: React.FC<{ 
    onSearch: (term: string, domain: string) => void;
    loading: boolean;
    history: string[];
}> = ({ onSearch, loading, history }) => {
    const [term, setTerm] = useState('');
    const [domain, setDomain] = useState('Urban Planning');

    const handleSearchClick = () => {
        if (term.trim()) {
            onSearch(term, domain);
        }
    };
    
    const handleHistoryClick = (historicalTerm: string) => {
        setTerm(historicalTerm);
        onSearch(historicalTerm, domain);
    };

    return (
        <div className="space-y-6 p-2">
            <div>
                <label htmlFor="term-search" className="form-label">جستجوی واژه</label>
                <div className="relative">
                    <input 
                        type="text" 
                        id="term-search" 
                        className="form-input pe-10" 
                        placeholder="مثال: فضای شهری"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
                    />
                     <Icon svg={SEARCH_ICON} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 w-5 h-5" />
                </div>
            </div>
            <div>
                <label htmlFor="domain-select" className="form-label">حوزه تخصصی</label>
                <select 
                    id="domain-select" 
                    className="form-input"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                >
                    <option>Urban Planning</option>
                    <option>Architecture</option>
                    <option>Sociology</option>
                    <option>General</option>
                </select>
            </div>
            <Button onClick={handleSearchClick} icon={SEARCH_ICON} className="w-full" disabled={loading}>
                {loading ? 'در حال جستجو...' : 'جستجو'}
            </Button>
            
            {history.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                    <h4 className="font-semibold text-white mb-2 text-sm">تاریخچه جستجو</h4>
                    <ul className="space-y-1">
                        {history.map((item, index) => (
                            <li key={index}>
                                <button onClick={() => handleHistoryClick(item)} className="text-sm text-gray-400 hover:text-primary transition-colors w-full text-right p-1 rounded">
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface TerminologyResult {
    term: string;
    definition: string;
    related_terms: string[];
}


const TerminologyBook: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [result, setResult] = useState<TerminologyResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const handleSearch = useCallback(async (term: string, domain: string) => {
        if (!term) return;
        setLoading(true);
        setError('');
        setResult(null);

        if (!history.includes(term)) {
            setHistory(prev => [term, ...prev].slice(0, 5)); // Keep last 5
        }

        const schema = {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING, description: "The term that was defined." },
            definition: { type: Type.STRING, description: "A detailed definition of the term." },
            related_terms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of related terms."
            },
          },
          required: ["term", "definition", "related_terms"],
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Define the term "${term}" in the context of ${domain}.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    systemInstruction: `You are an expert academic thesaurus specializing in Urban Studies. Your language is Persian. Define the term provided by the user concisely and accurately, then list a few related terms.`
                }
            });

            const jsonResponse = JSON.parse(response.text);
            setResult(jsonResponse);

        } catch (e) {
            console.error(e);
            setError("خطا در دریافت تعریف از سرویس هوش مصنوعی. لطفا دوباره تلاش کنید.");
        } finally {
            setLoading(false);
        }
    }, [ai, history]);

    useLayoutEffect(() => {
        setSidebarContent(<TerminologySidebar onSearch={handleSearch} loading={loading} history={history} />);
        return () => setSidebarContent(null);
    }, [setSidebarContent, handleSearch, loading, history]);

    return (
        <div className="page-container">
            <StaggeredGrid>
                <PageHeader title="واژه‌نامه تخصصی" subtitle="تعاریف دقیق و علمی واژگان تخصصی شهرسازی را بیابید." />
                
                {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
                
                <Card className="min-h-[60vh] flex flex-col justify-center">
                    {loading ? (
                        <div className="text-center">
                            <Icon svg={AI_ASSISTANT_ICON} className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                            <p className="text-gray-400">در حال جستجوی تعریف...</p>
                        </div>
                    ) : result ? (
                        <div className="p-4">
                            <h2 className="text-2xl font-bold text-primary mb-4">{result.term}</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.definition}</p>
                            <div className="mt-6 border-t border-white/10 pt-4">
                                <h4 className="font-semibold text-white mb-2">واژگان مرتبط</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.related_terms.map((related, i) => (
                                        <span key={i} className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                                            {related}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center text-gray-500">
                            <Icon svg={TERMINOLOGY_BOOK_ICON} className="w-20 h-20 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-white">به واژه‌نامه خوش آمدید</h2>
                            <p>برای شروع، واژه‌ی مورد نظر خود را از پنل کناری جستجو کنید.</p>
                        </div>
                    )}
                </Card>
            </StaggeredGrid>
        </div>
    );
};

export default TerminologyBook;
