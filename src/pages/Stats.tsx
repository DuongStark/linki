import React, { useState, useEffect } from 'react';
import { statsAPI } from '../services/api.ts';
import { StatsOverview, DailyStats } from '../types';

const Stats: React.FC = () => {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const overviewData = await statsAPI.getOverview();
        const dailyData = await statsAPI.getDailyStats();
        
        setOverview(overviewData);
        setDailyStats(dailyData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Calculate progress
  const progressData = {
    studied: overview ? Math.round((overview.studied / overview.total) * 100) || 0 : 0,
    mastered: overview ? Math.round((overview.mastered / overview.total) * 100) || 0 : 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600 section-title">Thống kê học tập</h1>
      
      {/* Tổng quan */}
      <div className="card mb-6 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Tổng quan</h2>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Đã học</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{overview?.studied || 0}/{overview?.total || 0}</span>
          </div>
          <div className="w-full bg-primary-100 dark:bg-primary-900 rounded-full h-2.5">
            <div className="bg-primary-500 h-2.5 rounded-full transition-all" style={{ width: `${progressData.studied}%` }}></div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Đã thuộc</span>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">{overview?.mastered || 0}/{overview?.total || 0}</span>
          </div>
          <div className="w-full bg-green-100 dark:bg-green-900 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${progressData.mastered}%` }}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="text-gray-500 dark:text-gray-300">Cần học hôm nay: <span className="font-bold text-orange-500">{overview?.dueToday || 0}</span></div>
          <div className="text-gray-500 dark:text-gray-300">Quá hạn: <span className="font-bold text-red-500">{overview?.overdue || 0}</span></div>
        </div>
      </div>
      
      {/* Thống kê theo ngày */}
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">
        Hoạt động 7 ngày qua
      </h2>
      {dailyStats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-100 dark:divide-primary-900">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Số lần ôn tập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Từ mới đã học
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50 dark:divide-primary-900">
              {dailyStats.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-100">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-100">
                    {day.reviewCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-100">
                    {day.newCards}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-neutral-500 dark:text-neutral-300">Không có dữ liệu.</div>
      )}
    </div>
  );
};

export default Stats; 