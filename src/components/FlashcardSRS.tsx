import React, { useState } from 'react';
import { VocabCard } from '../types';
import api from '../services/api.ts';

interface FlashcardSRSProps {
  card: VocabCard;
  onReview: (card: VocabCard, grade: number) => void;
}

const FlashcardSRS: React.FC<FlashcardSRSProps> = ({ card, onReview }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleShowAnswer = () => {
    setShowAnswer(true);
    playAudio();
  };

  const handleGrade = (grade: number) => {
    onReview(card, grade);
    setShowAnswer(false);
  };

  const playAudio = async () => {
    try {
      const token = localStorage.getItem('token'); // hoặc nơi bạn lưu token
      const response = await fetch(`${api.defaults.baseURL}/tts/${encodeURIComponent(card.word)}`, {
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

  return (
    <div className="rounded-2xl shadow-card p-10 border transition-all hover:shadow-lg bg-white dark:bg-neutral-800 border-primary-200 dark:border-neutral-700 max-w-md mx-auto my-4">
      <div className="text-2xl font-bold text-center mb-4 text-indigo-600">
        {card.word}
      </div>
      
      {card.phonetic && (
        <div className="text-neutral-500 dark:text-neutral-300 text-center mb-4">
          {card.phonetic}
        </div>
      )}
      
      {showAnswer ? (
        <>
          <div className="text-lg mb-2 text-neutral-800 dark:text-neutral-100">
            {card.meaning}
          </div>
          {card.example && (
            <div className="italic text-neutral-500 dark:text-neutral-300 mb-4">
              {card.example}
            </div>
          )}
          <div className="mt-6">
            <div className="text-sm text-center text-neutral-700 dark:text-neutral-300 mb-2">
              Mức độ nhớ:
            </div>
            <div className="flex justify-between gap-1">
              <button
                className="flex-1 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-red-500 hover:bg-red-600 focus:ring-red-300"
                onClick={() => handleGrade(0)}
              >
                Lại
              </button>
              <button
                className="flex-1 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300"
                onClick={() => handleGrade(2)}
              >
                Khó
              </button>
              <button
                className="flex-1 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-primary-500 hover:bg-primary-600 focus:ring-primary-400"
                onClick={() => handleGrade(3)}
              >
                Tốt
              </button>
              <button
                className="flex-1 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-green-500 hover:bg-green-600 focus:ring-green-300"
                onClick={() => handleGrade(4)}
              >
                Dễ
              </button>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-300 mt-1 px-1">
              <span>Lại</span>
              <span>Khó</span>
              <span>Tốt</span>
              <span>Dễ</span>
            </div>
          </div>
        </>
      ) : (
        <button
          className="btn-primary w-full py-3 text-lg"
          onClick={handleShowAnswer}
        >
          Hiện đáp án
        </button>
      )}
      
      {/* Audio control */}
      <button 
        onClick={playAudio}
        className="mt-4 text-secondary-600 dark:text-secondary-400 flex items-center justify-center w-full hover:underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        Phát âm
      </button>
    </div>
  );
};

export default FlashcardSRS; 