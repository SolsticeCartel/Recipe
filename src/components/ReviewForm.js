import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function ReviewForm({ onSubmit }) {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [error, setError] = useState('');
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsProfileComplete(Boolean(userData.username && userData.displayName));
        }
      }
    };
    checkProfile();
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isProfileComplete) {
      setError('Please complete your profile before adding a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    onSubmit({ rating, comment: comment.trim() });
    setComment('');
    setRating(5);
    setHoveredStar(0);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <p>Please log in to leave a review</p>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">Please complete your profile before adding reviews</p>
        <a href="/profile" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Complete Profile
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
      
      {/* Rating Stars */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-1 -ml-1 first:ml-0"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoveredStar || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating} stars` : 'Select rating'}
          </span>
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this recipe..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        Submit Review
      </button>
    </form>
  );
}

export default ReviewForm; 