import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { UploadCloud, MapPin, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../api.js';

// Component to handle map clicks and drop a pin
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Component to recenter map when geolocation succeeds
function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
}

function AddIssueForm({ onIssueSubmitted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  
  // Default to Delhi region fallback, but will try to get real location
  const [location, setLocation] = useState({ lat: 28.6692, lng: 77.4538 });
  const [geolocated, setGeolocated] = useState(false);
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Attempt to geolocate user on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGeolocated(true);
        },
        (error) => {
          console.warn("Geolocation failed or denied. Using fallback.", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !file || !location) {
      setError('Please fill out all required fields and upload a photo.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('address', address);
    
    // Convert Leaflet LatLng {lat, lng} to GeoJSON Point [lng, lat]
    const geoJsonLocation = {
      type: "Point",
      coordinates: [location.lng, location.lat] // LNG FIRST for MongoDB
    };
    formData.append('location', JSON.stringify(geoJsonLocation));
    
    formData.append('file', file);

    try {
      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onIssueSubmitted(res.data); 

      // Reset form
      setTitle('');
      setDescription('');
      setAddress('');
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-medium">
          {error}
        </div>
      )}
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Issue Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Massive pothole on Main St"
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Detailed Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail to help admins understand the severity..."
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-colors resize-none"
        ></textarea>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Location Reference (Optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <MapPin size={18} />
          </div>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., Near City Park Fountain"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-colors"
          />
        </div>
      </div>

      {/* Interactive Map */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Pinpoint on Map <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">Click anywhere on the map to set the exact location.</p>
        <div className="h-[250px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={13} 
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geolocated && <MapFlyTo position={location} />}
            <LocationMarker position={location} setPosition={setLocation} />
          </MapContainer>
        </div>
      </div>

      {/* Drag & Drop Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Photo Evidence <span className="text-red-500">*</span>
        </label>
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 ease-in-out text-center cursor-pointer flex flex-col items-center justify-center
            ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}
            ${previewUrl ? 'border-solid border-purple-200 p-2' : 'min-h-[160px]'}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={isSubmitting}
          />
          
          {previewUrl ? (
            <div className="relative w-full rounded-xl overflow-hidden group">
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                  className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-gray-50"
                >
                  Change Photo
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 text-purple-600">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </>
          )}
        </div>
      </div>

      {/* Submit */}
      <button 
        type="submit" 
        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Submitting Report...
          </>
        ) : (
          'Submit Issue & Earn Points'
        )}
      </button>
    </form>
  );
}

export default AddIssueForm;