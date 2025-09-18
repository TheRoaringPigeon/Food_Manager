import React from "react";
import './searchBar.css';

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-container">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;
