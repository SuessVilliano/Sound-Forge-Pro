
import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { MOCK_COURSES } from '../constants';

export const AcademyView: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Music Academy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Master the industry with expert courses.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {MOCK_COURSES.map(course => (
             <div key={course.id} className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group hover:border-cyan-500/50 transition-colors shadow-sm">
                <div className="h-40 bg-slate-100 dark:bg-slate-800 relative">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur text-slate-900 dark:text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        {course.category}
                    </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                     <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons} lessons</span>
                    </div>
                    <button className="w-full py-2 rounded-lg bg-cyan-500 text-white dark:text-slate-950 font-bold hover:bg-cyan-400">Enroll Now</button>
                </div>
             </div>
         ))}
      </div>
    </div>
  );
};
