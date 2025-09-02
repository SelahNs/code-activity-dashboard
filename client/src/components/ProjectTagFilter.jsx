// src/components/ProjectTagFilter.jsx (Rename ProjectFilter.jsx to this)

export default function ProjectTagFilter({
    tags = [],
    selectedTags = [],
    onTagClick,
    allTagsText = "All Tags"
}) {
    // A handler to clear all tags, which is better UX than the old way
    const handleClear = () => {
        // We pass a synthetic event-like object to the handler
        onTagClick({ target: { value: 'CLEAR_ALL' } });
    };

    return (
        <div className='flex gap-2 overflow-x-auto pb-2 custom-scrollbar dark:dark-custom-scrollbar'>
            <button
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-200 border
                    ${selectedTags.length === 0 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600'}`}
                onClick={handleClear}
            >
                {allTagsText}
            </button>
            {tags.map(tag => (
                <button
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-200 border
                        ${selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600'}`}
                    onClick={onTagClick} key={tag} value={tag}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}