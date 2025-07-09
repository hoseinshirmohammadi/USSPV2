import React, { useLayoutEffect } from 'react';
import { Card } from '../components/atoms/Card';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { SURVEYS_ICON } from '../constants';

const Surveys: React.FC = () => {
  useLayoutEffect(() => {
    // const { setSidebarContent } = useLayout();
    // setSidebarContent(null);
  }, []);

  return (
    <div className="page-container flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <Card className="text-center max-w-lg w-full">
        <Icon svg={SURVEYS_ICON} className="w-16 h-16 mx-auto text-primary mb-6" />
        <h1 className="text-2xl font-bold text-white">ماژول نظرسنجی پژوهشی</h1>
        <p className="text-gray-400 mt-2 mb-6">این ماژول در حال توسعه است و به زودی با سازنده فرم Drag & Drop و تحلیل آماری نتایج در دسترس خواهد بود.</p>
      </Card>
    </div>
  );
};

export default Surveys;