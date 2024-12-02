import { useState } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ onSearch, onTagFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    
    const commonTags = ['javascript', 'react', 'node.js', 'python', 'java', 'css'];

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleTagClick = (tag) => {
        const newTag = selectedTag === tag ? '' : tag;
        setSelectedTag(newTag);
        onTagFilter(newTag);
    };

    return (
        <div className="mb-8">
            <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search questions..."
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Search
                    </button>
                </div>
            </form>

            <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

SearchBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
    onTagFilter: PropTypes.func.isRequired,
};

export default SearchBar; 