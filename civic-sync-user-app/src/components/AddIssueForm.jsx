import { useState } from 'react';
import './AddIssueForm.css';
import api from '../api.js';

const issueCategories = [
  "Dead animal(s)", "Dustbins not cleaned", "Garbage dump", 
  "Garbage vehicle not arrived", "Sweeping not done", 
  "No electricity in public toilet(s)", "No water supply in public toilet(s)", 
  "Public toilet(s) blockage", "Public toilet(s) cleaning",
  "Open Manholes or Drains", "Sewerage or Storm water Overflow", 
  "Stagnant Water on the Road", "Improper Disposal of Faecal Waste/ Septage", 
  "Debris Removal/Construction Material", "Burning of Garbage in Open Spaces", 
  "Urination in Public/Open Defecation (OD)", "Other"
];

function AddIssueForm({ onIssueSubmitted }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGetLocation = () => {
    setIsSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        });
        setIsSubmitting(false);
      },
      (err) => {
        setError('Could not get GPS location. Please allow access.');
        setIsSubmitting(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !file || !location.lat || !location.lng || !category) {
      setError('Please fill out all fields, including category and file.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('address', address);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    formData.append('file', file);

    try {
      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onIssueSubmitted(res.data); 

      setTitle('');
      setCategory('');
      setAddress('');
      setLocation({ lat: '', lng: '' });
      setFile(null);
      document.getElementById('file-input').value = null;

    } catch (err) {
      console.error('Error during submission:', err);
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Failed to submit issue. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}
      
      <div className="form-group">
        <label htmlFor="title">Issue Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Broken streetlight on 5th Ave"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Select a Category</label>
        <select 
          id="category" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="" disabled>-- Please choose a category --</option>
          {issueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="address">Address / Location Description</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., Near City Park fountain, 123 Main St"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="file-input">Add a Photo or Video</label>
        <input
          type="file"
          id="file-input"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group location-group">
        <label>Coordinates (Latitude, Longitude)</label>
        
        <div className="coord-inputs">
          <input
            type="number"
            step="0.000001"
            placeholder="Latitude (e.g., 28.75)"
            value={location.lat}
            onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
            disabled={isSubmitting}
          />
          <input
            type="number"
            step="0.000001"
            placeholder="Longitude (e.g., 77.58)"
            value={location.lng}
            onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="button"
          className="location-button"
          onClick={handleGetLocation}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Capturing...' : 'Capture GPS Coordinates'}
        </button>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Issue'}
      </button>
    </form>
  );
}

export default AddIssueForm;