import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vocabAPI, statsAPI } from '../services/api.ts';
import { VocabCard, StatsOverview } from '../types';

const Dashboard: React.FC = () => {
  const [dueCards, setDueCards] = useState<VocabCard[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Lấy thống kê tổng quan
        const statsData = await statsAPI.getOverview();
        setStats(statsData);
        
        // Lấy các thẻ từ vựng cần ôn tập hôm nay
        const dueCardsData = await vocabAPI.getDueCards();
        setDueCards(dueCardsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề tổng quan */}
      <h1 className="text-3xl font-extrabold text-indigo-600 section-title text-center md:text-left mb-8 mt-4 hidden md:block">Tổng quan</h1>

      {/* Card chính trên mobile */}
      <div className="w-full max-w-md mx-auto md:max-w-none md:mx-0">
        <div className="card relative flex flex-col items-center justify-center py-8 px-6 min-h-[160px] border border-gray-200 shadow-xl rounded-3xl bg-white mb-6 md:mb-0 md:py-4 md:px-2 md:rounded-xl md:shadow-sm">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-100 rounded-full p-3 shadow-md md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
          </div>
          <h3 className="text-lg font-bold text-black mb-2 text-center">Từ cần học hôm nay</h3>
          <p className="text-5xl font-extrabold text-green-600 mb-4">{stats?.dueToday || 0}</p>
          <Link to="/study" className="btn-primary w-full text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center">
            <span className="mr-2">Học ngay</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          {/* Badge các chỉ số phụ trên mobile */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold shadow">Quá hạn: {stats?.overdue || 0}</div>
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold shadow">Tổng: {stats?.total || 0}</div>
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold shadow">Đã học: {stats?.studied || 0}</div>
          </div>
        </div>
      </div>

      {/* PC layout giữ nguyên */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="card flex flex-col items-center justify-center py-4 px-2 min-h-[120px] border border-gray-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-semibold text-black mb-1">Từ cần học hôm nay</h3>
          <p className="text-2xl font-bold text-black mb-2">{stats?.dueToday || 0}</p>
          <Link to="/study" className="btn-primary w-full mt-2 text-base py-2 flex items-center justify-center">
            <span className="mr-2">Học ngay</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 min-h-[120px] border border-gray-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-semibold text-black mb-1">Từ quá hạn</h3>
          <p className="text-2xl font-bold text-black mb-2">{stats?.overdue || 0}</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 min-h-[120px] border border-gray-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-semibold text-black mb-1">Tổng từ vựng</h3>
          <p className="text-2xl font-bold text-black mb-2">{stats?.total || 0}</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 min-h-[120px] border border-gray-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-semibold text-black mb-1">Đã học</h3>
          <p className="text-2xl font-bold text-black mb-2">{stats?.studied || 0}</p>
        </div>
      </div>
      
      {/* Từ cần học hôm nay */}
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">
        Từ cần học hôm nay ({dueCards.length})
      </h2>
      {dueCards.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueCards.slice(0, 6).map((card) => (
              <div key={card._id} className="card p-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{card.word}</h3>
                <p className="text-neutral-600 dark:text-neutral-300">{card.meaning}</p>
              </div>
            ))}
          </div>
          {dueCards.length > 6 && (
            <div className="text-center mt-4">
              <span className="text-neutral-500 dark:text-neutral-300">
                và {dueCards.length - 6} từ khác...
              </span>
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Link
              to="/study"
              className="btn-primary"
            >
              Bắt đầu học ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-neutral-500 dark:text-neutral-300">Không có từ nào cần học hôm nay.</p>
          <Link to="/vocab" className="btn-primary inline-block mt-4">
            Thêm từ mới
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 