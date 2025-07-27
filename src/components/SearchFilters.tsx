import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (availability: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availability, setAvailability] = useState('All');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAvailability(value);
    onFilterChange(value);
  };

  return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover & Share Skills
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with talented individuals, learn new skills, and share your expertise with others in our vibrant community.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by skill name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm h-12"
            />
          </div>

          {/* Availability Filter */}
          <div className="relative sm:w-40">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={availability}
              onChange={handleAvailabilityChange}
              className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white h-12"
            >
              <option value="All">All Times</option>
              <option value="Weekends">Weekends</option>
              <option value="Evenings">Evenings</option>
              <option value="Weekdays">Weekdays</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;