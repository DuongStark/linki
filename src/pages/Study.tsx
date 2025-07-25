import React, { useState, useEffect } from 'react';
import { vocabAPI } from '../services/api.ts';
import { deckAPI } from '../services/api.ts';
import { useSelectedDeck } from '../hooks/useSelectedDeck.ts';
import FlashcardSRS from '../components/FlashcardSRS.tsx';
import { useRef, type MutableRefObject } from 'react';
import { UserVocabProgress } from '../types';
import { buildStudyQueue } from '../utils/srsUtils.ts';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '../fade-transition.css';

const Study: React.FC = () => {
  const [cards, setCards] = useState<UserVocabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedDeckId } = useSelectedDeck();
  const debounceRef = useRef<number | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [learningCount, setLearningCount] = useState<number>(0);
  const [showGuide, setShowGuide] = useState(() => {
    // Chỉ hiển thị hướng dẫn nếu chưa từng tắt
    return localStorage.getItem('studyGuideDismissed') !== 'true';
  });

  const handleDismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem('studyGuideDismissed', 'true');
  };

  // Tối ưu: Đếm số lượng từng loại trực tiếp từ queue trả về (cards)
  const counts = React.useMemo(() => {
    let newCount = 0, learningCount = 0, reviewCount = 0;
    for (const card of cards) {
      if (card.srs?.state === 'new') newCount++;
      else if (card.srs?.state === 'learning') learningCount++; // Đếm tất cả thẻ learning, không lọc dueDate
      else if (card.srs?.state === 'review' && card.srs.dueDate && new Date(card.srs.dueDate) <= new Date()) reviewCount++;
    }
    return { new: newCount, learning: learningCount, review: reviewCount };
  }, [cards]);

  // --- Thêm state để lưu queue ổn định và seed random ---
  const [queue, setQueue] = useState<UserVocabProgress[]>([]);
  const [queueSeed, setQueueSeed] = useState<number>(Date.now());

  useEffect(() => {
    if (!selectedDeckId) {
      setError('Bạn cần chọn bộ từ để học ở trang Quản lý từ vựng!');
      setLoading(false);
      return;
    }
    const fetchCards = async () => {
      try {
        setLoading(true);
        if (typeof selectedDeckId === 'string') {
          const dueCards = await deckAPI.getDeckDue(selectedDeckId);
          setCards(dueCards);
          setCompleted(false);
        }
      } catch (error) {
        setError('Không thể tải danh sách thẻ. Vui lòng thử lại.');
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [selectedDeckId]);

  // Fetch learning count mỗi khi selectedDeckId hoặc sau khi review
  useEffect(() => {
    if (!selectedDeckId) return;
    const fetchLearningCount = async () => {
      try {
        const count = await deckAPI.getLearningCount(selectedDeckId);
        setLearningCount(count);
      } catch (e) {
        setLearningCount(0);
      }
    };
    fetchLearningCount();
  }, [selectedDeckId, cards]);

  // --- Cập nhật queue mỗi khi cards thay đổi ---
  useEffect(() => {
    const newQueue = buildStudyQueue(cards, queueSeed);
    setQueue(newQueue);
    setCurrentCardIndex(prevIdx => {
      const currentId = queue[prevIdx]?._id;
      const idx = newQueue.findIndex(c => c._id === currentId);
      if (idx !== -1) return idx;
      if (prevIdx < newQueue.length - 1) return prevIdx;
      return 0;
    });
  }, [cards, queueSeed]);

  // currentCardIndex phải luôn nằm trong queue mới
  useEffect(() => {
    if (currentCardIndex >= queue.length) setCurrentCardIndex(0);
  }, [queue.length]);
  const currentCard = queue[currentCardIndex] || null;
  const currentState = currentCard?.srs?.state;

  // --- Khi review xong, đổi seed để random lại learningDue ---
  const handleGradeCard = async (grade: number) => {
    if (!queue[currentCardIndex]) return;
    setLoading(true);
    try {
      await vocabAPI.review(queue[currentCardIndex]._id, grade);
      // Debounce fetch queue mới
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (typeof selectedDeckId === 'string') {
          const dueCards = await deckAPI.getDeckDue(selectedDeckId);
          setCards(dueCards);
          setQueueSeed(Date.now()); // Đổi seed để random learningDue mới
        }
        setLoading(false);
      }, 200);
    } catch (error: any) {
      let msg = 'Có lỗi khi gửi kết quả. Vui lòng thử lại.';
      if (error?.response?.status === 401) {
        msg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow mb-4 text-center max-w-xs">
          {error}
        </div>
        <button className="btn-primary" onClick={() => window.location.reload()}>Tải lại trang</button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-200 mb-4">
          Chưa có từ nào để học!
        </h1>
        <p className="text-neutral-500 dark:text-neutral-300 mb-6">
          Bạn đã hoàn thành tất cả các từ cho hôm nay hoặc chưa có từ vựng nào.
        </p>
        <a href="/vocab" className="btn-primary">
          Thêm từ mới
        </a>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold text-indigo-600 section-title mb-4">
          Chúc mừng!
        </h1>
        <p className="text-neutral-500 dark:text-neutral-300 mb-6">
          Bạn đã hoàn thành tất cả {cards.length} từ cho ngày hôm nay.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/" className="btn-primary">
            Quay về trang chủ
          </a>
          <a href="/stats" className="btn-secondary">
            Xem thống kê
          </a>
        </div>
      </div>
    );
  }

  // Thêm UI hiển thị số lượng từng loại ở trên cùng
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-neutral-900 pb-[80px] px-2">
      {showGuide && (
        <div className="w-full max-w-sm mx-auto mt-4 mb-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-blue-900 dark:text-blue-100 shadow text-sm relative">
          <div className="mb-2 font-semibold text-blue-700 dark:text-blue-200">Hướng dẫn nhanh</div>
          <ul className="list-disc pl-5 mb-2">
            <li>Ấn <b>Hiện đáp án</b> để xem nghĩa và ví dụ.</li>
            <li>Chọn mức độ nhớ (Lại, Khó, Tốt, Dễ) để hệ thống tự động lên lịch lặp lại tối ưu.</li>
            <li>Bạn có thể nghe phát âm bằng nút <b>Phát âm</b>.</li>
            <li>Học đều mỗi ngày để tối ưu trí nhớ!</li>
          </ul>
          <button onClick={handleDismissGuide} className="absolute top-2 right-2 text-xs px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded hover:bg-blue-300 dark:hover:bg-blue-700 transition">Đã hiểu</button>
        </div>
      )}
      <div className="w-full max-w-xs sm:max-w-sm mx-auto mt-2 mb-2">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
          <div className={
            `rounded-lg sm:rounded-xl py-1 sm:py-2 transition-all ` +
            (currentState === 'new'
              ? 'border-2 border-blue-500 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 shadow-lg'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200')
          }>
            <div className="text-[10px] sm:text-xs font-medium">New</div>
            <div className="text-base sm:text-xl font-bold">{counts.new}</div>
          </div>
          <div className={
            `rounded-lg sm:rounded-xl py-1 sm:py-2 transition-all ` +
            (currentState === 'learning'
              ? 'border-2 border-yellow-500 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 shadow-lg'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200')
          }>
            <div className="text-[10px] sm:text-xs font-medium">Learning</div>
            <div className="text-base sm:text-xl font-bold">{learningCount}</div>
          </div>
          <div className={
            `rounded-lg sm:rounded-xl py-1 sm:py-2 transition-all ` +
            (currentState === 'review'
              ? 'border-2 border-green-500 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 shadow-lg'
              : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200')
          }>
            <div className="text-[10px] sm:text-xs font-medium">Review</div>
            <div className="text-base sm:text-xl font-bold">{counts.review}</div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-sm mx-auto">
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentCard?._id || 'empty'}
            timeout={250}
            classNames="fade"
            unmountOnExit
          >
            <div>
              <FlashcardSRS
                card={currentCard}
                loading={loading}
                onReview={async (_card, grade) => {
                  await handleGradeCard(grade);
                }}
              />
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};

export default Study; 