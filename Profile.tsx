
import React from 'react';
import { Card } from '../components/atoms/Card';
import { USER_PROFILE_DATA, RECENT_ACTIVITY_DATA, ACTIVITY_PULSE_ICON } from '../constants';
import { Icon } from '../components/atoms/Icon';
import { ActivityItem } from '../components/molecules/ActivityItem';
import { useAppContext } from '../hooks/useAppContext';
import { Button } from '../components/atoms/Button';
import { StaggeredGrid } from '../components/atoms/StaggeredGrid';
import { Badge } from '../components/atoms/Badge';
import { AchievementType } from '../types';
import { Tooltip } from '../components/atoms/Tooltip';
import { motion } from 'framer-motion';

const AchievementCard: React.FC<{ achievement: AchievementType }> = ({ achievement }) => {
    return (
      <Tooltip text={achievement.description} position="top">
        <Card className={`flex flex-col items-center justify-center text-center transition-all duration-300 ${achievement.unlocked ? 'opacity-100 glow-border' : 'opacity-40 grayscale'}`}>
            <div className={`p-3 rounded-full mb-3 ${achievement.unlocked ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Icon svg={achievement.icon} className={`w-8 h-8 ${achievement.unlocked ? 'text-primary' : 'text-gray-500'}`} />
            </div>
            <p className="text-sm font-bold text-white">{achievement.name}</p>
        </Card>
      </Tooltip>
    );
};


const Profile: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    const { level, points, achievements, skills, name, title, organization, website, joinDate, avatarUrl, bio } = USER_PROFILE_DATA;
    
    const pointsForNextLevel = 1000;
    const currentLevelProgress = (points % pointsForNextLevel) / pointsForNextLevel * 100;

  return (
    <div className="page-container">
        <StaggeredGrid className="space-y-8">
            <Card className="overflow-hidden" padding="p-0">
                <div className="h-48 bg-cover bg-center relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=2000&auto=format&fit=crop')"}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-[#101016]/80 to-transparent"></div>
                </div>
                <div className="p-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-24 sm:-mt-20">
                        <img src={avatarUrl} alt={name} className="w-32 h-32 rounded-full border-4 border-[#101016] bg-gray-800" />
                        <div className="ms-0 sm:ms-6 mt-4 sm:mt-0 text-center sm:text-right">
                            <h1 className="text-3xl font-bold text-white">{name}</h1>
                            <p className="text-md text-primary">{title}</p>
                            <p className="text-sm text-gray-400 mt-1">عضو از {joinDate}</p>
                        </div>
                        <Button onClick={() => setCurrentPage('settings')} variant="secondary" size="sm" className="absolute top-6 end-6">
                            ویرایش پروفایل
                        </Button>
                    </div>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <h3 className="font-bold text-white text-lg mb-4">سطح و امتیاز</h3>
                        <div className="text-center mb-4">
                            <p className="text-5xl font-bold text-primary">{level}</p>
                            <p className="text-gray-400 text-sm">سطح فعلی</p>
                        </div>
                        <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>امتیاز فعلی: {points.toLocaleString()}</span>
                                <span>سطح بعدی</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2.5">
                                <motion.div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${currentLevelProgress}%` }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                />
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-2">{pointsForNextLevel - (points % pointsForNextLevel)} امتیاز تا سطح بعدی</p>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-white text-lg mb-4">مهارت‌ها</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => <Badge key={skill} color="blue">{skill}</Badge>)}
                        </div>
                    </Card>
                    
                    <Card>
                        <h3 className="font-bold text-white text-lg mb-4">درباره من</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{bio}</p>
                         <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
                            <p><strong className="text-white font-medium">موسسه:</strong> {organization}</p>
                            <p><strong className="text-white font-medium">وبسایت:</strong> <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{website}</a></p>
                         </div>
                    </Card>

                </div>

                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h3 className="font-bold text-white text-lg mb-4">دستاوردها</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {achievements.map(ach => (
                                <AchievementCard key={ach.id} achievement={ach} />
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center mb-4">
                            <div className="p-1.5 bg-yellow-400/20 text-yellow-400 rounded-md me-3"><Icon svg={ACTIVITY_PULSE_ICON} className="w-5 h-5"/></div>
                            <h3 className="font-bold text-white text-lg">فعالیت‌های اخیر</h3>
                        </div>
                         <div className="divide-y divide-white/10">
                            {RECENT_ACTIVITY_DATA.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </StaggeredGrid>
    </div>
  );
};
export default Profile;
