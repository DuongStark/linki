import React, { useState, useEffect } from 'react';
import { vocabAPI } from '../services/api.ts';
import { deckAPI } from '../services/api.ts';
import { useSelectedDeck } from '../hooks/useSelectedDeck.ts';
import FlashcardSRS from '../components/FlashcardSRS.tsx';

const Study: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedDeckId } = useSelectedDeck();

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

  const currentCard = cards[currentCardIndex];

  const handleGradeCard = async (grade: number) => {
    if (!currentCard) return;
    try {
      await vocabAPI.review(currentCard._id, grade);
      // Refetch lại danh sách thẻ đến hạn từ backend
      setLoading(true);
      if (typeof selectedDeckId === 'string') {
        const dueCards = await deckAPI.getDeckDue(selectedDeckId);
        setCards(dueCards);
      }
      // Tìm vị trí thẻ tiếp theo (nếu còn)
      if (cards.length > 0) {
        // Nếu còn thẻ tiếp theo, chuyển sang thẻ đó
        setCurrentCardIndex(Math.min(currentCardIndex, cards.length - 1));
      } else {
        setCompleted(true);
      }
      setLoading(false);
    } catch (error: any) {
      let msg = 'Có lỗi khi gửi kết quả. Vui lòng thử lại.';
      if (error?.response?.status === 401) {
        msg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      }
      setError(msg);
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

  // Thay thế phần hiển thị flashcard và chấm điểm bằng FlashcardSRS
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-neutral-900 pb-[80px] px-2">
      <div className="mb-4 mt-4 text-center w-full">
        <p className="text-sm text-neutral-500 dark:text-neutral-300">
          {currentCardIndex + 1} / {cards.length}
        </p>
      </div>
      <div className="w-full max-w-sm mx-auto">
        <FlashcardSRS
          card={currentCard}
          onReview={async (_card, grade) => {
            await handleGradeCard(grade);
          }}
        />
      </div>
    </div>
  );
};

export default Study; 