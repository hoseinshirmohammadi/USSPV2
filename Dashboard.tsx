
import React from 'react';
import { Card } from '../components/atoms/Card';
import { Icon } from '../components/atoms/Icon';
import { StatCard } from '../components/molecules/StatCard';
import { QuickActionCard } from '../components/molecules/QuickActionCard';
import { DataChart } from '../components/organisms/DataChart';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import {
  STATS_CARDS_DATA,
  QUICK_ACTIONS_DATA,
  WEEKLY_PROGRESS_DATA,
  USER_PROFILE_DATA,
  CHART_BAR_ICON,
  ACTIVE_TASKS_DATA,
  ACTIVE_TASK_ICON
} from '../constants';
import { QuickActionCardType, StatCardType, ActiveTaskType } from '../types';
import { useLayout } from '../hooks/useLayout';

const WelcomeHeader: React.FC = () => (
  <div className="mb-8">
    <h1 className="text-4xl font-bold text-white">خوش آمدید،</h1>
    <h2 className="text-4xl font-bold text-gradient-primary">{USER_PROFILE_DATA.name}!</h2>
    <p className="text-gray-400 mt-3">یک نمای کلی از فعالیت‌ها و پیشرفت‌های شما</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { setSidebarContent } = useLayout();

  React.useLayoutEffect(() => {
    // Dashboard page now uses the default left sidebar content.
    setSidebarContent(null);
    return () => setSidebarContent(null);
  }, [setSidebarContent]);


  return (
    <div className="page-container">
      <StaggeredGrid className="space-y-8">
        <WelcomeHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_CARDS_DATA.map((stat: StatCardType) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <DataChart title="پیشرفت هفتگی" icon={<Icon svg={CHART_BAR_ICON} className="w-5 h-5"/>} data={WEEKLY_PROGRESS_DATA} />
            </div>
            <div className="lg:col-span-1">
              <Card>
                  <h3 className="font-bold text-white text-lg mb-4">اقدامات سریع</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {QUICK_ACTIONS_DATA.slice(0, 4).map((action: QuickActionCardType) => (
                          <QuickActionCard key={action.id} action={action} />
                      ))}
                  </div>
              </Card>
            </div>
        </div>
        
        <Card padding="p-4">
           <div className="flex items-center mb-4">
             <div className="p-1.5 bg-primary/10 text-primary rounded-md me-3"><Icon svg={ACTIVE_TASK_ICON} className="w-5 h-5" /></div>
             <h3 className="font-bold text-white text-lg">وظایف فعال</h3>
           </div>
            <div className="space-y-4">
                {ACTIVE_TASKS_DATA.map((task: ActiveTaskType) => (
                    <Card key={task.id} className="bg-primary/10" padding="p-4">
                        <p className="text-sm font-medium text-white">{task.title}</p>
                        <p className="text-xs text-primary mb-2">{task.project}</p>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                        </div>
                         <div className="flex justify-between text-xs mt-1">
                            <span>پیشرفت</span>
                            <span>{task.progress}%</span>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>

      </StaggeredGrid>
    </div>
  );
};

export default Dashboard;
