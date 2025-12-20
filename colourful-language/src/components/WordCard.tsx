import React, { useState } from 'react';
import './WordCard.css';

interface WordCardProps {
  country: string;
  insultOgLang: string;
  pronounciation: string;
  accent: string;
  insultLiteralMeaning: string;
  insultActualMeaning: string;
}

const WordCard: React.FC<WordCardProps> = ({ 
  country, 
  insultOgLang, 
  pronounciation,
  accent, 
  insultLiteralMeaning, 
  insultActualMeaning 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`word-card ${isFlipped ? 'flipped' : ''}`} onClick={handleClick}>
      <div className="word-card-inner">
        <div className="word-card-front">
          <span className="insult-og">{insultOgLang}</span>
          <span className="country">{country}</span>
        </div>
        <div className="word-card-back">
            <div className="card-field">
            <span className="insult-og">{insultOgLang}</span>
          </div>
          <div className="card-field">
            <span className="field-label">Pronunciation</span>
            <span className="field-value">{pronounciation}</span>
          </div>
          <div className="card-field">
            <span className="field-label">Language</span>
            <span className="field-value">{accent}</span>
          </div>
          <div className="card-field">
            <span className="field-label">Country</span>
            <span className="field-value">{country}</span>
          </div>
          <div className="card-field">
            <span className="field-label">Literal Meaning</span>
            <span className="field-value">{insultLiteralMeaning}</span>
          </div>
          <div className="card-field">
            <span className="field-label">Actual Meaning</span>
            <span className="field-value">{insultActualMeaning}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
