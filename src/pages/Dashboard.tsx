import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vocabAPI, statsAPI, deckAPI } from '../services/api.ts';
import { StatsOverview, Deck, UserVocabProgress } from '../types';
import { useSelectedDeck } from '../hooks/useSelectedDeck.ts';

const Dashboard: React.FC = () => {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [dueCards, setDueCards] = useState<UserVocabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextDue, setNextDue] = useState<{ hours: number|null, minutes: number|null } | null>(null);
  const { selectedDeckId } = useSelectedDeck();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [deckStats, setDeckStats] = useState<{ total: number, studied: number, mastered: number, dueToday: number } | null>(null);
  const [learnedToday, setLearnedToday] = useState(0);
  const [showSubCards, setShowSubCards] = useState(false);

  // Gom các API call chính thành một Promise.all
  useEffect(() => {
    if (!selectedDeckId) return;
    setLoading(true);
    Promise.all([
      deckAPI.getDeck(selectedDeckId),
      deckAPI.getDeckDue(selectedDeckId),
      statsAPI.getOverview()
    ]).then(([deck, dueCards, overview]) => {
      setSelectedDeck(deck);
      setDueCards(dueCards);
      setStats(overview);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedDeckId]);

  // Chỉ gọi fetchNextDue khi selectedDeck thay đổi
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedDeck) {
      fetchNextDue();
    }
  }, [selectedDeck]);

  // Chỉ gọi fetchLearnedToday khi selectedDeck hoặc stats thay đổi
  useEffect(() => {
    const fetchLearnedToday = async () => {
      if (!selectedDeck) return setLearnedToday(0);
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDeck.type === 'shared') {
        const progress = await deckAPI.getDeckProgress(selectedDeck._id);
        let count = 0;
        for (const p of progress) {
          if (p.reviewHistory && p.reviewHistory.some((r: any) => r.date && r.date.startsWith(todayStr))) {
            count++;
          }
        }
        setLearnedToday(count);
      } else {
        const dailyStats = await statsAPI.getDailyStats();
        const todayStats = dailyStats.find((d: any) => d.date === todayStr);
        setLearnedToday(todayStats?.reviewCount || 0);
      }
    };
    fetchLearnedToday();
    // eslint-disable-next-line
  }, [selectedDeck, stats]);

  // Refetch khi window focus lại (quay lại tab)
  useEffect(() => {
    const onFocus = () => {
      if (selectedDeckId) fetchDueCards(selectedDeckId);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [selectedDeckId]);

  useEffect(() => {
    const onFocus = () => {
      if (selectedDeckId) fetchNextDue();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [selectedDeckId, selectedDeck]);

  useEffect(() => {
    const fetchDeckStats = async () => {
      if (!selectedDeck) return;
      if (selectedDeck.type === 'shared') {
        // Lấy tổng số từ của deck shared
        const vocab = await deckAPI.getDeckVocab(selectedDeck._id);
        setDeckStats({ total: vocab.length, studied: 0, mastered: 0, dueToday: 0 });
      } else {
        // Deck cá nhân, lấy stats như cũ
        setDeckStats({
          total: stats?.total || 0,
          studied: stats?.studied || 0,
          mastered: stats?.mastered || 0,
          dueToday: stats?.dueToday || 0
        });
      }
    };
    fetchDeckStats();
  }, [selectedDeck, stats]);

  useEffect(() => {
    if (!loading) {
      setShowSubCards(false);
      const timer = setTimeout(() => setShowSubCards(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowSubCards(false);
    }
  }, [loading, selectedDeckId]);

  const fetchDueCards = async (deckId: string) => {
    setLoading(true);
    const cards = await deckAPI.getDeckDue(deckId);
    setDueCards(cards);
    setLoading(false);
  };

  const fetchNextDue = async () => {
    try {
      if (!selectedDeck) return;
      const res = await vocabAPI.getNextDue(selectedDeck._id, selectedDeck.type);
      setNextDue(res);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedDeckId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-yellow-100 text-yellow-700 px-6 py-4 rounded-xl shadow mb-4 text-center max-w-xs">
          Bạn cần chọn bộ từ ở trang <a href='/vocab' className='underline text-primary-600'>Quản lý từ vựng</a> trước khi học.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-2">
      {/* Card lớn ở giữa */}
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-3xl shadow-xl p-6 flex flex-col items-center mb-6">
        <div className="text-gray-500 text-sm mb-2">Từ cần học hiện tại</div>
        <div className="text-6xl font-extrabold text-primary-500 mb-4 min-h-[56px] flex items-center justify-center">
          {loading
            ? <span className="h-8 w-8 animate-spin border-4 border-primary-500 border-t-transparent rounded-full block"></span>
            : dueCards.length}
        </div>
        <Link
          to={dueCards.length > 0 ? `/study?deck=${selectedDeck?._id}` : "#"}
          className={`w-full text-lg py-3 rounded-full font-bold flex items-center justify-center transition-all duration-200 ${dueCards.length === 0 ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-primary-500 text-white hover:bg-primary-600'}`}
          tabIndex={dueCards.length === 0 ? -1 : 0}
          aria-disabled={dueCards.length === 0}
        >
          Học ngay
        </Link>
        {/* Thông báo thời gian còn lại cho từ tiếp theo */}
        {!loading && dueCards.length === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            {nextDue && (nextDue.hours !== null || nextDue.minutes !== null)
              ? `Thẻ tiếp theo sẽ xuất hiện sau${nextDue.hours !== null && nextDue.hours > 0 ? ` ${nextDue.hours} giờ` : ''}${nextDue.minutes !== null && nextDue.minutes > 0 ? ` ${nextDue.minutes} phút` : ''} nữa.`
              : 'Bạn đã hoàn thành hết các thẻ hôm nay!'}
          </div>
        )}
      </div>
      {/* Các thông số nhỏ gọn bên dưới */}
      {deckStats && showSubCards && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6 transition-all duration-500 opacity-100 translate-y-0">
          <div className="card flex flex-col items-center bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
            <span className="text-2xl font-bold text-primary-500">{deckStats?.total || 0}</span>
            <span className="text-gray-500 dark:text-gray-300">Tổng số từ</span>
          </div>
          <div className="card flex flex-col items-center bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
            <span className="text-2xl font-bold text-blue-500">{deckStats?.studied || 0}</span>
            <span className="text-gray-500 dark:text-gray-300">Đã học</span>
          </div>
          <div className="card flex flex-col items-center bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
            <span className="text-2xl font-bold text-green-600 flex items-center">
              {deckStats?.mastered || 0}
              <svg className="h-5 w-5 ml-1 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
            </span>
            <span className="text-gray-500 dark:text-gray-300">Đã thuộc</span>
          </div>
          <div className="card flex flex-col items-center bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
            <span className="text-2xl font-bold text-orange-500">{learnedToday}</span>
            <span className="text-gray-500 dark:text-gray-300">Đã học hôm nay</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 