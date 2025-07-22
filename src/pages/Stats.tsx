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
      <div className="card">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Tổng quan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-medium text-indigo-600 mb-2">
              Tiến độ học tập
            </h3>
            
            {/* Tiến độ đã học */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  Đã học
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {progressData.studied}%
                </span>
              </div>
              <div className="w-full bg-primary-100 dark:bg-primary-900 rounded-full h-2.5">
                <div
                  className="bg-primary-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${progressData.studied}%` }}
                ></div>
              </div>
            </div>
            
            {/* Tiến độ đã thuộc */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
                  Đã thuộc
                </span>
                <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
                  {progressData.mastered}%
                </span>
              </div>
              <div className="w-full bg-primary-100 dark:bg-primary-900 rounded-full h-2.5">
                <div
                  className="bg-secondary-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${progressData.mastered}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-300">Tổng số từ:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">{overview?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-300">Đã học:</span>
                <span className="font-semibold text-primary-700 dark:text-primary-200">{overview?.studied || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-300">Đã thuộc:</span>
                <span className="font-semibold text-secondary-500 dark:text-secondary-300">{overview?.mastered || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-300">Từ mới:</span>
                <span className="font-semibold text-secondary-500 dark:text-secondary-300">{overview?.new || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-300">Cần học hôm nay:</span>
                <span className="font-semibold text-primary-500 dark:text-primary-300">{overview?.dueToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-300">Quá hạn:</span>
                <span className="font-semibold text-secondary-500 dark:text-secondary-300">{overview?.overdue || 0}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-indigo-600 mb-2">
              Thông tin từ vựng
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tổng số từ:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{overview?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Đã học:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{overview?.studied || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Đã thuộc:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{overview?.mastered || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Từ mới:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{overview?.new || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cần học hôm nay:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{overview?.dueToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quá hạn:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{overview?.overdue || 0}</span>
              </div>
            </div>
          </div>
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