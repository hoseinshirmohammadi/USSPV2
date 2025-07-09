
import React, { useState, useLayoutEffect, useMemo } from 'react';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { USER_PROFILE_DATA, USER_ICON, NOTIFICATION_ICON, PLAGIARISM_ICON, DEVICE_DESKTOP_ICON, DEVICE_PHONE_ICON, CREDIT_CARD_ICON, API_KEY_ICON, PALETTE_ICON } from '../constants';
import { useLayout } from '../hooks/useLayout';
import { Icon } from '../components/atoms/Icon';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { ThemeSwitcher } from '../components/organisms/ThemeSwitcher';
import { useAppContext } from '../hooks/useAppContext';
import { Badge } from '../components/atoms/Badge';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

type SettingsSection = 'account' | 'notifications' | 'security' | 'billing' | 'appearance' | 'api';

const SettingsSidebar: React.FC<{ activeSection: SettingsSection; onSectionChange: (section: SettingsSection) => void; }> = ({ activeSection, onSectionChange }) => {
    const navItems = [
        { id: 'account', label: 'حساب کاربری', icon: USER_ICON },
        { id: 'appearance', label: 'ظاهر و پوسته', icon: PALETTE_ICON },
        { id: 'notifications', label: 'اطلاع‌رسانی‌ها', icon: NOTIFICATION_ICON },
        { id: 'security', label: 'امنیت', icon: PLAGIARISM_ICON },
        { id: 'billing', label: 'طرح و صورتحساب', icon: CREDIT_CARD_ICON },
        { id: 'api', label: 'کلیدهای API', icon: API_KEY_ICON },
    ];
    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4">تنظیمات</h3>
            <nav className="space-y-1">
                {navItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => onSectionChange(item.id as SettingsSection)}
                        className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${activeSection === item.id ? 'bg-primary/20 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                        <Icon svg={item.icon} className={`w-5 h-5 me-3 ${activeSection === item.id ? 'text-primary' : 'text-gray-500'}`} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    )
};

const Toggle: React.FC<{ label: string; description: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-4">
        <div>
            <p className="font-medium text-white">{label}</p>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="form-toggle-bg"></div>
        </label>
    </div>
);

const allAvatars = [
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Urbanist",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Researcher",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Scientist",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Analyst",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Scholar",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Explorer",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Professor",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Architect"
];

const AccountSettings: React.FC<{ settings: any, onChange: (field: string, value: any) => void }> = ({ settings, onChange }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="form-label">نام کامل</label>
                <input type="text" className="form-control" value={settings.name} onChange={e => onChange('name', e.target.value)} />
            </div>
             <div>
                <label className="form-label">عنوان شغلی</label>
                <input type="text" className="form-control" placeholder="مثال: پژوهشگر شهری" value={settings.title} onChange={e => onChange('title', e.target.value)} />
            </div>
            <div>
                <label className="form-label">بیوگرافی</label>
                <textarea rows={3} className="form-control" value={settings.bio} onChange={e => onChange('bio', e.target.value)}></textarea>
            </div>
            <div>
                <label className="form-label">تصویر پروفایل</label>
                <div className="flex flex-wrap items-center gap-2">
                    {allAvatars.map(avatarSrc => (
                         <img 
                            key={avatarSrc} 
                            src={avatarSrc} 
                            alt="Avatar" 
                            className={`w-16 h-16 rounded-full cursor-pointer transition-all duration-200 ${settings.avatarUrl === avatarSrc ? 'ring-4 ring-primary scale-110' : 'opacity-60 hover:opacity-100'}`} 
                            onClick={() => onChange('avatarUrl', avatarSrc)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const AppearanceSettings: React.FC = () => {
    const { handleThemeChange } = useAppContext();
    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-white mb-2">رنگ اصلی</h4>
                <p className="text-sm text-gray-400 mb-4">رنگ برجسته رابط کاربری را انتخاب کنید.</p>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <ThemeSwitcher onThemeChange={handleThemeChange} />
                </div>
            </div>
        </div>
    );
};


const NotificationSettings: React.FC<{ settings: any, onChange: (field: string, value: any) => void }> = ({ settings, onChange }) => (
    <div className="divide-y divide-white/10">
        <Toggle label="اعلان‌های ایمیلی" description="دریافت اعلان‌ها در مورد فعالیت‌های مهم" checked={settings.emailNotifications} onChange={e => onChange('emailNotifications', e.target.checked)} />
        <Toggle label="خبرنامه" description="عضویت در خبرنامه هفتگی" checked={settings.newsletter} onChange={e => onChange('newsletter', e.target.checked)} />
        <Toggle label="اعلان‌های درون‌برنامه‌ای" description="نمایش هشدارها در داخل پلتفرم" checked={settings.appNotifications} onChange={e => onChange('appNotifications', e.target.checked)} />
        <Toggle label="به‌روزرسانی‌های پروژه" description="اعلان برای وظایف و همکاری‌ها" checked={settings.projectUpdates} onChange={e => onChange('projectUpdates', e.target.checked)} />
        <Toggle label="نکات هوش مصنوعی" description="دریافت پیشنهادات و نکات از دستیار هوشمند" checked={settings.aiTips} onChange={e => onChange('aiTips', e.target.checked)} />
    </div>
);

const SecuritySettings: React.FC = () => {
    return (
        <div className="space-y-8">
            <Card className="bg-white/5" padding="p-4">
                <h4 className="font-bold text-white mb-3">تغییر رمز عبور</h4>
                <div className="space-y-4">
                     <div>
                        <label className="form-label">رمز عبور فعلی</label>
                        <input type="password" placeholder="••••••••" className="form-control" />
                    </div>
                     <div>
                        <label className="form-label">رمز عبور جدید</label>
                        <input type="password" placeholder="••••••••" className="form-control" />
                    </div>
                     <div>
                        <label className="form-label">تکرار رمز عبور جدید</label>
                        <input type="password" placeholder="••••••••" className="form-control" />
                    </div>
                    <div className="text-right">
                        <Button variant="secondary" size="sm">به‌روزرسانی رمز</Button>
                    </div>
                </div>
            </Card>

            <Card className="bg-white/5" padding="p-4">
                <h4 className="font-bold text-white mb-3">جلسات فعال</h4>
                <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Icon svg={DEVICE_DESKTOP_ICON} className="w-6 h-6 text-green-400" />
                            <div>
                                <p className="font-semibold text-white">Chrome on Windows</p>
                                <p className="text-xs text-gray-400">تهران، ایران (دستگاه فعلی)</p>
                            </div>
                        </div>
                    </li>
                     <li className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Icon svg={DEVICE_PHONE_ICON} className="w-6 h-6 text-gray-400" />
                            <div>
                                <p className="font-semibold text-white">Safari on iPhone</p>
                                <p className="text-xs text-gray-400">اصفهان، ایران - ۲ روز پیش</p>
                            </div>
                        </div>
                         <Button size="sm" variant="secondary">خروج</Button>
                    </li>
                </ul>
            </Card>

            <Card className="border-red-500/50 bg-red-900/10" padding="p-4">
                <h4 className="font-bold text-red-300 mb-2">منطقه خطر</h4>
                <p className="text-sm text-red-400 mb-4">این اقدامات قابل بازگشت نیستند. لطفا با احتیاط عمل کنید.</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-white">حذف حساب کاربری</p>
                        <p className="text-sm text-gray-400">تمام اطلاعات شما برای همیشه پاک خواهد شد.</p>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm">حذف حساب</Button>
                </div>
            </Card>
        </div>
    );
}

const BillingSettings: React.FC = () => (
    <div className="space-y-6">
        <Card className="bg-primary/10">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h4 className="font-bold text-white">طرح فعلی شما: <Badge color="primary">حرفه‌ای</Badge></h4>
                    <p className="text-sm text-gray-400 mt-1">صورتحساب بعدی شما در تاریخ ۱۴۰۳/۰۵/۱۵ صادر می‌شود.</p>
                </div>
                <Button variant="secondary">مدیریت طرح</Button>
            </div>
        </Card>
        <div>
            <h4 className="font-bold text-white mb-3">میزان مصرف</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white/5" padding="p-4">
                    <p className="text-sm text-gray-400">کلمات تولید شده</p>
                    <p className="text-xl font-bold text-white">۱۲۰,۱۵۰ / <span className="text-base font-normal text-gray-400">۵۰۰,۰۰۰</span></p>
                    <div className="w-full bg-black/20 rounded-full h-2 mt-2"><div className="bg-primary h-2 rounded-full" style={{width: '24%'}}></div></div>
                </Card>
                <Card className="bg-white/5" padding="p-4">
                    <p className="text-sm text-gray-400">تصاویر تولید شده</p>
                    <p className="text-xl font-bold text-white">۲۳ / <span className="text-base font-normal text-gray-400">۱۰۰</span></p>
                    <div className="w-full bg-black/20 rounded-full h-2 mt-2"><div className="bg-green-500 h-2 rounded-full" style={{width: '23%'}}></div></div>
                </Card>
                <Card className="bg-white/5" padding="p-4">
                    <p className="text-sm text-gray-400">بررسی سرقت ادبی</p>
                    <p className="text-xl font-bold text-white">۷ / <span className="text-base font-normal text-gray-400">۲۰</span></p>
                    <div className="w-full bg-black/20 rounded-full h-2 mt-2"><div className="bg-yellow-500 h-2 rounded-full" style={{width: '35%'}}></div></div>
                </Card>
            </div>
        </div>
    </div>
);

const ApiSettings: React.FC = () => (
     <div className="space-y-6">
        <Card className="bg-white/5" padding="p-4">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h4 className="font-bold text-white">کلیدهای API</h4>
                    <p className="text-sm text-gray-400 mt-1">از این کلیدها برای اتصال سرویس‌های خارجی استفاده کنید.</p>
                </div>
                <Button>ایجاد کلید جدید</Button>
            </div>
        </Card>
         <Card className="bg-white/5" padding="p-4">
             <p className="text-white font-mono text-sm truncate">prm_sk_live_******************xwz1</p>
             <div className="flex items-center justify-between mt-2">
                 <p className="text-xs text-gray-400">ایجاد شده در ۱۴۰۳/۰۲/۱۰ - آخرین استفاده: امروز</p>
                 <Button variant="secondary" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/20">باطل کردن</Button>
             </div>
        </Card>
     </div>
);


const Settings: React.FC = () => {
    const { setSidebarContent } = useLayout();
    const [activeSection, setActiveSection] = useState<SettingsSection>('account');
    
    const initialSettings = useMemo(() => ({
        account: {
            name: USER_PROFILE_DATA.name,
            bio: USER_PROFILE_DATA.bio,
            avatarUrl: USER_PROFILE_DATA.avatarUrl,
            title: USER_PROFILE_DATA.title,
        },
        notifications: {
            emailNotifications: true,
            newsletter: false,
            appNotifications: true,
            projectUpdates: true,
            aiTips: false,
        },
    }), []);

    const [settings, setSettings] = useState(initialSettings);
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleSettingsChange = (section: 'account' | 'notifications', field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            }
        }));
        if (!isDirty) setIsDirty(true);
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            setIsDirty(false);
            // In a real app, you would dispatch an action to update global state
            console.log("Saved Settings:", settings);
        }, 1500);
    };

    useLayoutEffect(() => {
        setSidebarContent(<SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />);
        return () => setSidebarContent(null);
    }, [setSidebarContent, activeSection]);

    const renderContent = () => {
        switch (activeSection) {
            case 'account': return <AccountSettings settings={settings.account} onChange={(field, value) => handleSettingsChange('account', field, value)} />;
            case 'appearance': return <AppearanceSettings />;
            case 'notifications': return <NotificationSettings settings={settings.notifications} onChange={(field, value) => handleSettingsChange('notifications', field, value)} />;
            case 'security': return <SecuritySettings />;
            case 'billing': return <BillingSettings />;
            case 'api': return <ApiSettings />;
            default: return null;
        }
    }

    return (
        <div className="page-container">
            <StaggeredGrid>
                <PageHeader title="تنظیمات" subtitle="تنظیمات حساب کاربری و پلتفرم خود را مدیریت کنید." />
                <Card>
                    <div className="p-6 min-h-[500px]">
                        {renderContent()}
                    </div>
                     <div className="border-t border-white/10 p-4 flex justify-end">
                        <Button onClick={handleSave} disabled={!isDirty || saveStatus === 'saving'}>
                            {saveStatus === 'saving' ? 'در حال ذخیره...' : saveStatus === 'saved' ? 'ذخیره شد!' : 'ذخیره تغییرات'}
                        </Button>
                    </div>
                </Card>
            </StaggeredGrid>
        </div>
    );
};
export default Settings;
