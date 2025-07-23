import React, { useState, useEffect } from 'react';
import { vocabAPI } from '../services/api.ts';
import api from '../services/api.ts';
import { VocabCard } from '../types';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { useLocation } from 'react-router-dom';
import { deckAPI } from '../services/api.ts';
import { useSelectedDeck } from '../hooks/useSelectedDeck.ts';

function isLearningDue(card) {
  return card.srs && card.srs.state === 'learning' && new Date(card.srs.dueDate) <= new Date();
}

const Study: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
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
        const dueCards = await deckAPI.getDeckDue(selectedDeckId);
        setCards(dueCards);
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

  const handleShowAnswer = () => {
    setShowAnswer(true);
    if (currentCard) {
      playAudio(currentCard.word);
    }
  };

  const handleGradeCard = async (grade: number) => {
    if (!currentCard) return;
    try {
      await vocabAPI.review(currentCard._id, grade);
      // Refetch lại danh sách thẻ đến hạn từ backend
      setLoading(true);
      const dueCards = await deckAPI.getDeckDue(selectedDeckId);
      setCards(dueCards);
      // Tìm vị trí thẻ tiếp theo (nếu còn)
      if (dueCards.length > 0) {
        // Nếu còn thẻ tiếp theo, chuyển sang thẻ đó
        setCurrentCardIndex(Math.min(currentCardIndex, dueCards.length - 1));
        setShowAnswer(false);
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

  const playAudio = async (word: string) => {
    try {
      const token = localStorage.getItem('token'); // hoặc nơi bạn lưu token
      const response = await fetch(`${api.defaults.baseURL}/tts/${encodeURIComponent(word)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Không lấy được audio');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('Audio play error:', err);
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-neutral-900 pb-[80px] px-2">
      <div className="mb-4 mt-4 text-center w-full">
        <p className="text-sm text-neutral-500 dark:text-neutral-300">
          {currentCardIndex + 1} / {cards.length}
        </p>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-3xl shadow-2xl bg-white dark:bg-neutral-800 p-4 sm:p-6 min-h-[320px] max-h-[70vh] flex flex-col items-center justify-center transition-all">
          <div className="flex flex-col items-center w-full overflow-y-auto" style={{maxHeight: '55vh'}}>
            <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-2 break-words">
              {currentCard?.word}
            </h2>
            {currentCard?.phonetic && (
              <p className="text-neutral-500 dark:text-neutral-300 text-center mb-2">
                {currentCard.phonetic}
              </p>
            )}
            {/* Nút nghe phát âm */}
            <div className="flex justify-center mt-1 mb-2 w-full">
              <button
                className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 shadow-md active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-primary-400"
                onClick={() => playAudio(currentCard.word)}
                aria-label="Nghe phát âm"
                tabIndex={0}
              >
                <SpeakerWaveIcon className="h-8 w-8 text-primary-500" />
              </button>
            </div>
            {showAnswer && (
              <div className="mt-2 text-center w-full">
                <p className="text-lg text-neutral-800 dark:text-neutral-100 font-semibold break-words">
                  {currentCard?.meaning}
                </p>
                {/* Nếu có ảnh minh họa */}
                {currentCard?.imageUrl && (
                  <img src={currentCard.imageUrl} alt="minh họa" className="max-w-full max-h-40 object-contain mx-auto mb-2 mt-2 rounded-xl" />
                )}
                {currentCard?.example && (
                  <p className="text-neutral-500 dark:text-neutral-300 italic mt-2 break-words">
                    {currentCard.example}
                  </p>
                )}
              </div>
            )}
          </div>

          {!showAnswer ? (
            <button
              className="btn-primary mt-6 w-full py-3 text-lg rounded-full shadow-lg active:scale-95 transition-transform"
              onClick={handleShowAnswer}
            >
              Hiện đáp án
            </button>
          ) : (
            <div className="mt-6 w-full">
              <p className="text-center text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                Mức độ nhớ:
              </p>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map(grade => (
                  <button
                    key={grade}
                    className={`flex-1 py-3 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white text-lg shadow-md active:scale-95 ${
                      grade < 3
                        ? 'bg-secondary-400 hover:bg-secondary-500 focus:ring-secondary-300'
                        : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-400'
                    }`}
                    onClick={() => handleGradeCard(grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-300 mt-1 px-1">
                <span>Khó</span>
                <span>Dễ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Study; 