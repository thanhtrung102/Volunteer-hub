import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import * as yup from 'yup';

// Mock location data for autocomplete
const LOCATION_SUGGESTIONS = [
  "Central Park, New York, NY",
  "Community Center, Downtown",
  "Public Library, Main St",
  "City Hall Plaza",
  "Riverside Park",
  "Senior Living Facility, Oak Ave",
  "Food Bank Warehouse, Industrial Park",
  "High School Gymnasium",
  "Veterans Memorial Hall",
  "Convention Center, Westside",
  "Beachfront Pavilion",
  "University Campus, North Hall"
];

// Validation Schema
const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters').max(500, 'Description cannot exceed 500 characters'),
  location: yup.string().required('Location is required'),
  category: yup.string().required('Category is required'),
  startDate: yup.date().required('Start date is required').typeError('Invalid start date'),
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date')
    .typeError('Invalid end date'),
  imageUrl: yup.string().url('Must be a valid URL (e.g., https://...)').nullable()
});

const ManageEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Community',
    startDate: '',
    endDate: '',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Autocomplete State
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Environment', 'Education', 'Community', 'Health', 'Crisis Support'];

  useEffect(() => {
    const fetchEvent = async () => {
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const event = await eventService.getEventById(Number(id));
          if (event) {
            // Authorization Check
            if (user?.role !== UserRole.ADMIN && event.createdBy !== user?.id) {
                setGlobalError("You do not have permission to edit this event.");
                return; // Stop processing
            }

            // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
            const formatForInput = (dateStr: string) => {
                const date = new Date(dateStr);
                return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            };

            setFormData({
              title: event.title,
              description: event.description,
              location: event.location,
              category: event.category || 'Community',
              startDate: formatForInput(event.startDate),
              endDate: formatForInput(event.endDate),
              imageUrl: event.imageUrl || ''
            });
          } else {
            setGlobalError('Event not found');
          }
        } catch (err) {
          setGlobalError('Failed to load event details');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEvent();
  }, [id, isEditMode, user]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Validation Helper
  const validateField = async (name: string, value: any) => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = yup.reach(validationSchema, name) as yup.Schema;
      
      // Special handling for endDate which depends on startDate reference
      if (name === 'endDate') {
         await validationSchema.validateAt('endDate', { ...formData, endDate: value });
      } else {
         await fieldSchema.validate(value);
      }
      
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update State
    setFormData(prev => ({ ...prev, [name]: value }));

    // Trigger validation if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }

    // Handle Location Autocomplete logic
    if (name === 'location') {
      if (value.length > 0) {
        const filtered = LOCATION_SUGGESTIONS.filter(loc => 
          loc.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLocations(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Auto-formatting: Capitalize Title
    if (name === 'title' && value) {
       const formattedTitle = value.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
       setFormData(prev => ({ ...prev, title: formattedTitle }));
       validateField(name, formattedTitle); // Validate the formatted value
    } else {
       validateField(name, value);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, location: suggestion }));
    setFilteredLocations([]);
    setShowSuggestions(false);
    setErrors(prev => ({ ...prev, location: '' })); // Clear location error on selection
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setIsLoading(true);

    // Validate all fields before submission
    try {
      await validationSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.inner.forEach((error: any) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      
      // Mark all as touched to show errors
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => allTouched[key] = true);
      setTouched(allTouched);
      
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        createdBy: user?.id || 0
      };

      if (isEditMode && id) {
        await eventService.updateEvent(Number(id), payload);
      } else {
        await eventService.createEvent(payload);
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setGlobalError(err.message || 'An error occurred while saving the event');
    } finally {
      setIsLoading(false);
    }
  };

  // If permission denied, show error state but keep layout
  if (globalError === "You do not have permission to edit this event.") {
      return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-r" role="alert">
                <p className="font-bold">Access Denied</p>
                <p>{globalError}</p>
                <button onClick={() => navigate('/dashboard')} className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded">Return to Dashboard</button>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-primary sm:text-3xl sm:truncate">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below. Fields marked with <span className="text-red-500">*</span> are required.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-200" noValidate>
        {globalError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-r" role="alert">
                <p className="font-medium">Error</p>
                <p className="text-sm">{globalError}</p>
            </div>
        )}

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          
          {/* Title Input */}
          <div className="sm:col-span-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Event Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.title && touched.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-secondary focus:border-secondary'}`}
                placeholder="e.g. Community Beach Cleanup"
              />
            </div>
            {touched.title && errors.title && (
              <p className="mt-1 text-xs text-red-600 animate-pulse">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">We'll automatically capitalize the title for you.</p>
          </div>

          {/* Category Select */}
          <div className="sm:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className="shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              >
                  {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Description Textarea with Character Count */}
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.description && touched.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-secondary focus:border-secondary'}`}
                placeholder="Describe the purpose and activities..."
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              {touched.description && errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : <span></span>}
              <span className={`text-xs ${formData.description.length > 450 ? 'text-orange-500' : 'text-gray-400'}`}>
                {formData.description.length}/500 characters
              </span>
            </div>
          </div>

          {/* Location Input with Autocomplete */}
          <div className="sm:col-span-6 relative" ref={locationInputRef}>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="location"
                id="location"
                autoComplete="off"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={() => { if(formData.location) setShowSuggestions(true); }}
                className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.location && touched.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-secondary focus:border-secondary'}`}
                placeholder="Start typing to search locations..."
              />
               {/* Autocomplete Dropdown */}
               {showSuggestions && filteredLocations.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredLocations.map((suggestion, index) => (
                    <li
                      key={index}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
                      onClick={() => handleSuggestionClick(suggestion)}
                      role="option"
                    >
                      <div className="flex items-center">
                        <span className="font-normal block truncate">
                          {suggestion}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
             {touched.location && errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Date Inputs */}
          <div className="sm:col-span-3">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.startDate && touched.startDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-secondary focus:border-secondary'}`}
              />
            </div>
             {touched.startDate && errors.startDate && (
              <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.endDate && touched.endDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-secondary focus:border-secondary'}`}
              />
            </div>
             {touched.endDate && errors.endDate && (
              <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
            )}
          </div>
          
          {/* Image URL */}
          <div className="sm:col-span-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Cover Image URL</label>
            <div className="mt-1">
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`shadow-sm block w-full sm:text-sm rounded-md p-2 border ${errors.imageUrl && touched.imageUrl ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-secondary focus:border-secondary'}`}
                placeholder="https://example.com/image.jpg"
              />
            </div>
             {touched.imageUrl && errors.imageUrl && (
              <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>
            )}
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-all 
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transform hover:-translate-y-0.5'}`}
            >
              {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
              ) : (
                  isEditMode ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageEvent;