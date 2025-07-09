import React, { useLayoutEffect } from 'react';
import { Card } from '../components/atoms/Card';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { RESEARCH_TOOLKIT_ICON } from '../constants';

const ResearchToolkit: React.FC = () => {
  useLayoutEffect(() => {
    // const { setSidebarContent } = useLayout();
    // setSidebarContent(null);
  }, []);

  return (
    <div className="page-container flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <Card className="text-center max-w-lg w-full">
        <Icon svg={RESEARCH_TOOLKIT_ICON} className="w-16 h-16 mx-auto text-primary mb-6" />
        <h1 className="text-2xl font-bold text-white">جعبه ابزار پژوهش</h1>
        <p className="text-gray-400 mt-2 mb-6">این ماژول در حال توسعه است. به زودی با ابزارهای مدیریت منابع، یادداشت‌برداری و زمان‌بندی پژوهش در خدمت شما خواهیم بود.</p>
      </Card>
    </div>
  );
};

export default ResearchToolkit;