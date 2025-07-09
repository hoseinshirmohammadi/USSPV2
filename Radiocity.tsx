
import React, { useLayoutEffect } from 'react';
import { Card } from '../components/atoms/Card';
import { Icon } from '../components/atoms/Icon';
import { useLayout } from '../hooks/useLayout';
import { RADIOCITY_ICON } from '../constants';

const Radiocity: React.FC = () => {
  const { setSidebarContent } = useLayout();
  useLayoutEffect(() => {
    setSidebarContent(null);
  }, [setSidebarContent]);

  return (
    <div className="page-container flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <Card className="text-center max-w-lg w-full">
        <Icon svg={RADIOCITY_ICON} className="w-16 h-16 mx-auto text-primary mb-6" />
        <h1 className="text-2xl font-bold text-white">رادیوسیتی</h1>
        <p className="text-gray-400 mt-2 mb-6">این ماژول (شهر مجازی و شبکه‌اجتماعی اختصاصی) در حال توسعه است.</p>
      </Card>
    </div>
  );
};

export default Radiocity;
