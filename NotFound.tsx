import React from 'react';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { useAppContext } from '../hooks/useAppContext';
import { HOME_ICON } from '../constants';

const NotFound: React.FC = () => {
    const { setCurrentPage } = useAppContext();

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] page-container">
        <Card className="text-center">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-bold text-white mt-4">صفحه مورد نظر یافت نشد</h2>
            <p className="text-gray-400 mt-2">متاسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد.</p>
            <div className="mt-8">
                <Button onClick={() => setCurrentPage('dashboard')} icon={HOME_ICON}>
                    بازگشت به داشبورد
                </Button>
            </div>
        </Card>
    </div>
  );
};

export default NotFound;