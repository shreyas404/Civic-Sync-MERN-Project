import './FilterControls.css';

// We receive the current filter and the function to change it
function FilterControls({ currentFilter, onFilterChange }) {
  
  const filters = ['all', 'open', 'pending', 'resolved'];

  return (
    <div className="filter-controls">
      {filters.map(filter => (
        <button
          key={filter}
          // We make the active button look different
          className={currentFilter === filter ? 'active' : ''}
          // When clicked, we call the function from App.jsx
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default FilterControls;