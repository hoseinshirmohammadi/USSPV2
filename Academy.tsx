import React from 'react';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { ACADEMY_COURSES_DATA } from '../constants';
import { CourseType } from '../types';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 mt-2">{subtitle}</p>
  </div>
);

const CourseCard: React.FC<{ course: CourseType }> = ({ course }) => (
    <Card className="overflow-hidden group glass-card-hover cursor-pointer" padding="p-0">
        <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"/>
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-white group-hover:text-primary transition-colors">{course.title}</h3>
                 <Badge color="primary">{course.tag}</Badge>
            </div>
            <p className="text-sm text-gray-400">{course.instructor}</p>
            <p className="text-xs text-gray-500 mt-2">{course.duration}</p>
        </div>
    </Card>
);

const Academy: React.FC = () => {
  return (
    <div className="page-container">
      <PageHeader title="آکادمی شهرسازی هوشمند" subtitle="دانش خود را در زمینه مطالعات شهری و فناوری‌های نوین گسترش دهید." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ACADEMY_COURSES_DATA.map(course => (
            <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};
export default Academy;