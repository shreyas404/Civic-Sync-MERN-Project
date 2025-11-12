// We need useState here to keep track of what the user is typing
import { useState } from 'react';
import './AddIssueForm.css';

function AddIssueForm({ onAddIssue }) {
  const [newIssueTitle, setNewIssueTitle] = useState('');
  
  // 1. NEW STATE: Add state to track the form's error message
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setNewIssueTitle(event.target.value);
    
    // 2. As soon as the user starts typing, clear any error
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); 
    
    // 3. Instead of alert(), we now SET THE ERROR STATE
    if (newIssueTitle.trim() === '') {
      setError('Please enter an issue title!');
      return;
    }

    // This part is the same
    onAddIssue(newIssueTitle);
    setNewIssueTitle('');
    setError(''); // Clear error on successful submit
  };

  return (
    // We add a className to the form if there is an error
    <form className={`add-issue-form ${error ? 'has-error' : ''}`} onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input 
          type="text" 
          placeholder="What's the issue?"
          value={newIssueTitle} 
          onChange={handleInputChange} 
        />
        {/* 4. We conditionally show the error message */}
        {error && <p className="form-error">{error}</p>}
      </div>
      <button type="submit">Add Issue</button>
    </form>
  );
}

export default AddIssueForm;