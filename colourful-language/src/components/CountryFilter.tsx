import React, { useState } from 'react';
import './CountryFilter.css';

interface CountryFilterProps {
  countries: string[];
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
}

const CountryFilter: React.FC<CountryFilterProps> = ({ countries, selectedCountries, onCountriesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sortedCountries = [...countries].sort();
  const filteredCountries = sortedCountries.filter(country => 
    country.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedCountries.includes(country)
  );

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter(c => c !== country));
    } else {
      onCountriesChange([...selectedCountries, country]);
      setSearchTerm('');
    }
  };

  const handleRemoveTag = (country: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCountriesChange(selectedCountries.filter(c => c !== country));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCountriesChange([]);
  };

  return (
    <div className="country-filter">
      <div className="select-container">
        <div 
          className="select-input"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="tags-and-input">
            {selectedCountries.sort().map((country) => (
              <span key={country} className="country-tag">
                {country}
                <button 
                  className="remove-tag"
                  onClick={(e) => handleRemoveTag(country, e)}
                  aria-label={`Remove ${country}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="search-input"
              placeholder={selectedCountries.length === 0 ? "Search or select countries..." : ""}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
          </div>
          
          {selectedCountries.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              Clear all
            </button>
          )}
          
          <span className="dropdown-arrow"></span>
        </div>

        {isOpen && (
          <>
            <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
            <div className="country-dropdown">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={country}
                    className="country-option"
                    onClick={() => handleCountryToggle(country)}
                  >
                    {country}
                  </div>
                ))
              ) : (
                <div className="no-results">No countries found</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CountryFilter;
