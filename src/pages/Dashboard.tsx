import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vocabAPI, statsAPI } from '../services/api.ts';
import { VocabCard, StatsOverview } from '../types';

const Dashboard: React.FC = () => {
  const [dueCards, setDueCards] = useState<VocabCard[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextDue, setNextDue] = useState<{ hours: number|null, minutes: number|null } | null>(null);

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
        // Nếu không còn thẻ cần học, lấy thời gian đến thẻ tiếp theo
        if (dueCardsData.length === 0) {
          const nextDueData = await vocabAPI.getNextDue();
          setNextDue(nextDueData);
        } else {
          setNextDue(null);
        }
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
      <h1 className="text-2xl font-bold text-primary-500 text-center mb-2">Tổng quan</h1>

      {/* Card chính trên mobile */}
      <div className="w-full max-w-xs mx-auto md:max-w-none md:mx-0">
        <div className="card relative flex flex-col items-center justify-center py-8 px-4 min-h-[120px] border border-gray-200 shadow-xl rounded-3xl bg-white mb-4 md:mb-0 md:py-4 md:px-2 md:rounded-xl md:shadow-sm">
          <h3 className="text-base font-semibold text-gray-700 mb-2 text-center">Từ cần học hiện tại</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl font-extrabold text-primary-500">{dueCards.length}</span>
          </div>
          <Link
            to={dueCards.length > 0 ? "/study" : "#"}
            className={`btn-primary w-full text-lg py-3 rounded-full shadow-lg flex items-center justify-center transition-opacity ${dueCards.length === 0 ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
            tabIndex={dueCards.length === 0 ? -1 : 0}
            aria-disabled={dueCards.length === 0}
          >
            <span className="mr-2">Học ngay</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          {dueCards.length === 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {nextDue && nextDue.hours !== null && nextDue.minutes !== null && (nextDue.hours > 0 || nextDue.minutes > 0) ? (
                <>
                  Bạn sẽ có thẻ mới sau{' '}
                  <span className="font-bold text-primary-500">
                    {nextDue.hours > 0 ? `${nextDue.hours} giờ ` : ''}
                    {nextDue.minutes > 0 ? `${nextDue.minutes} phút` : ''}
                  </span>
                  {' '}nữa.
                </>
              ) : (
                <>Hiện tại không còn thẻ nào sắp đến hạn.</>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Badge các chỉ số phụ trên mobile */}
      <div className="flex justify-center gap-2 md:hidden">
        <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shadow">Quá hạn: {stats?.overdue || 0}</div>
        <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shadow">Tổng: {stats?.total || 0}</div>
        <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shadow">Đã học: {stats?.studied || 0}</div>
      </div>

      {/* PC layout giữ nguyên */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="card flex flex-col items-center justify-center py-4 px-2 min-h-[120px] border border-gray-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-semibold text-black mb-1">Từ cần học hiện tại</h3>
          <p className="text-2xl font-bold text-black mb-2">{dueCards.length}</p>
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
    </div>
  );
};

export default Dashboard; 