import React, { useState, useEffect } from 'react';
import { vocabAPI } from '../services/api.ts';
import api from '../services/api.ts';
import { VocabCard } from '../types';

const Study: React.FC = () => {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const dueCards = await vocabAPI.getDueCards();
        setCards(dueCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const currentCard = cards[currentCardIndex];

  const handleShowAnswer = () => {
    setShowAnswer(true);
    // Phát âm từ khi hiển thị đáp án
    if (currentCard) {
      playAudio(currentCard.word);
    }
  };

  const handleGradeCard = async (grade: number) => {
    if (!currentCard) return;

    try {
      await vocabAPI.review(currentCard._id, grade);
      
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error grading card:', error);
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
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-300">
          {currentCardIndex + 1} / {cards.length}
        </p>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="flashcard h-64 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
              {currentCard?.word}
            </h2>
            
            {currentCard?.phonetic && (
              <p className="text-neutral-500 dark:text-neutral-300 text-center mb-4">
                {currentCard.phonetic}
              </p>
            )}
            
            {showAnswer && (
              <div className="mt-4 text-center">
                <p className="text-lg text-neutral-800 dark:text-neutral-100">
                  {currentCard?.meaning}
                </p>
                {currentCard?.example && (
                  <p className="text-neutral-500 dark:text-neutral-300 italic mt-2">
                    {currentCard.example}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {!showAnswer ? (
            <button 
              className="btn-primary m-4"
              onClick={handleShowAnswer}
            >
              Hiện đáp án
            </button>
          ) : (
            <div className="p-4">
              <p className="text-center text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                Mức độ nhớ:
              </p>
              <div className="flex justify-between gap-1">
                {[0, 1, 2, 3, 4, 5].map(grade => (
                  <button
                    key={grade}
                    className={`flex-1 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${
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