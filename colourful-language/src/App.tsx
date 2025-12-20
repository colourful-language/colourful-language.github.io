import React, { useState, useMemo, useEffect } from 'react';
import logo from './logo-black.svg';
import './App.css';
import WordCard from './components/WordCard';
import CountryFilter from './components/CountryFilter';

interface WordData {
  country: string;
  insultOgLang: string;
  pronounciation: string;
  accent: string;
  insultLiteralMeaning: string;
  insultActualMeaning: string;
}

function App() {
  const [words, setWords] = useState<WordData[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load data from TSV file
  useEffect(() => {
    fetch('/data.tsv')
      .then(response => response.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const data: WordData[] = [];
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const [country, insultOgLang, pronounciation, accent, insultLiteralMeaning, insultActualMeaning] = lines[i].split('\t');
          data.push({
            country: country.trim(),
            insultOgLang: insultOgLang.trim(),
            pronounciation: pronounciation.trim(),
            accent: accent.trim(),
            insultLiteralMeaning: insultLiteralMeaning.trim(),
            insultActualMeaning: insultActualMeaning.trim()
          });
        }
        
        // Shuffle the data before setting it
        const shuffledData = shuffleArray(data);
        setWords(shuffledData);
      })
      .catch(error => console.error('Error loading data:', error));
  }, []);

  // Get unique countries from the data
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(words.map(item => item.country)));
    return uniqueCountries.sort();
  }, [words]);

  // Filter words based on selected country
  const filteredWords = useMemo(() => {
    if (selectedCountries.length === 0) {
      return words;
    }
    return words.filter(item => selectedCountries.includes(item.country));
  }, [selectedCountries, words]);

  // Handle scroll to update arrow visibility
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;
    
    // Show up arrow if scrolled down more than 50px
    setShowUpArrow(scrollTop > 50);
    
    // Show down arrow if not at bottom (with 50px threshold)
    setShowDownArrow(scrollTop + clientHeight < scrollHeight - 50);
    
    // Show left arrow if scrolled right more than 50px
    setShowLeftArrow(scrollLeft > 50);
    
    // Show right arrow if not at right edge (with 50px threshold)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 50);
  };

  // Check scroll on mount and when filtered words change
  React.useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      const hasVerticalScroll = element.scrollHeight > element.clientHeight;
      const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
      
      // Only center the scroll position on initial load
      if (isInitialLoad && filteredWords.length > 0) {
        // Use setTimeout to ensure the grid has rendered
        setTimeout(() => {
          if (element) {
            const centerX = Math.max(0, (element.scrollWidth - element.clientWidth) / 2);
            const topY = 0;
            element.scrollTo(centerX, topY);
            
            // Check arrow visibility after positioning
            const hasVerticalScrollAfter = element.scrollHeight > element.clientHeight;
            const hasHorizontalScrollAfter = element.scrollWidth > element.clientWidth;
            setShowDownArrow(hasVerticalScrollAfter);
            setShowUpArrow(false);
            setShowRightArrow(hasHorizontalScrollAfter && centerX < element.scrollWidth - element.clientWidth - 50);
            setShowLeftArrow(hasHorizontalScrollAfter && centerX > 50);
          }
        }, 100);
        setIsInitialLoad(false);
      } else if (!isInitialLoad) {
        // For filter changes, just scroll to top-left
        element.scrollTo(0, 0);
        setShowDownArrow(hasVerticalScroll);
        setShowUpArrow(false);
        setShowRightArrow(hasHorizontalScroll);
        setShowLeftArrow(false);
      }
    }
  }, [filteredWords, isInitialLoad]);

  // Set up global mouse event listeners for drag
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (contentRef.current) {
          contentRef.current.style.cursor = 'grab';
          contentRef.current.style.userSelect = 'auto';
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  // Scroll functions
  const scrollUp = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: -300, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't start drag if clicking on a word card
    const target = e.target as HTMLElement;
    if (target.closest('.word-card')) return;
    
    if (contentRef.current) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: contentRef.current.scrollLeft,
        scrollTop: contentRef.current.scrollTop
      });
      contentRef.current.style.cursor = 'grabbing';
      contentRef.current.style.scrollBehavior = 'auto';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !contentRef.current) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const newScrollLeft = dragStart.scrollLeft - deltaX;
    const newScrollTop = dragStart.scrollTop - deltaY;
    contentRef.current.scrollLeft = newScrollLeft;
    contentRef.current.scrollTop = newScrollTop;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (contentRef.current) {
        contentRef.current.style.cursor = 'grab';
        contentRef.current.style.scrollBehavior = 'smooth';
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (contentRef.current) {
        contentRef.current.style.cursor = 'grab';
        contentRef.current.style.scrollBehavior = 'smooth';
      }
    }
  };

  return (
        <div className="App">
            <header className="App-header">
              <h1 className="app-title">
                <img src={logo} alt="logo" className="title-logo" /> colourful language <img src={logo} alt="logo" className="title-logo" />
              </h1>
              <div className="filter-wrapper">
                <CountryFilter 
                    countries={countries}
                    selectedCountries={selectedCountries}
                    onCountriesChange={setSelectedCountries}
                  />
              </div>
            </header>
            <div className="disclaimer"><em>This website was created with data from Reddit. If you notice any hateful content that is offensive to any peoples, please let me know!</em></div>
            <div 
              className="content" 
              ref={contentRef} 
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {showUpArrow && (
                <div className="scroll-indicator scroll-indicator-up" onClick={scrollUp}>
                  <span>↑</span>
                </div>
              )}
              {showLeftArrow && (
                <div className="scroll-indicator scroll-indicator-left" onClick={scrollLeft}>
                  <span>←</span>
                </div>
              )}
              {showRightArrow && (
                <div className="scroll-indicator scroll-indicator-right" onClick={scrollRight}>
                  <span>→</span>
                </div>
              )}
              <div className="words-container">
                {filteredWords.map((item, index) => (
                  <WordCard 
                      key={index} 
                      country={item.country}
                      insultOgLang={item.insultOgLang}
                      pronounciation={item.pronounciation}
                      accent={item.accent}
                      insultLiteralMeaning={item.insultLiteralMeaning}
                      insultActualMeaning={item.insultActualMeaning}
                    />
                  ))}
                </div>
              {showDownArrow && (
                <div className="scroll-indicator scroll-indicator-down" onClick={scrollDown}>
                  <span>↓</span>
                </div>
              )}
            </div>
            <footer className="footer">Made with 🔥 in Melbourne 🍁
            </footer>
        </div>
    )
}

export default App;
