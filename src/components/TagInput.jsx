import { useState } from 'react';

export default function TagInput({ tags, setTags, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (value) => {
    const val = value.trim().replace(/,$/, '');
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.keyCode === 13) {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // Allow comma to trigger tag addition on mobile where keydown might fail
    if (val.includes(',')) {
      addTag(val.replace(',', ''));
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="tag-area">
      {tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag}
          <button type="button" className="tag-x" onClick={() => removeTag(index)}>
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    </div>
  );
}
