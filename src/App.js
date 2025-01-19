import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import UploadRecipe from './pages/UploadRecipe';
import RecipeDetails from './pages/RecipeDetails';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { RecipeProvider } from './context/RecipeContext';
import { useState } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import EditRecipe from './pages/EditRecipe';

function App() {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">Something went wrong</h1>
          <pre className="text-sm text-gray-600">{error.message}</pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <RecipeProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route 
                  path="/upload" 
                  element={
                    <ProtectedRoute>
                      <UploadRecipe />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/recipe/:id" element={<RecipeDetails />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/recipe/edit/:id" element={
                  <ProtectedRoute>
                    <EditRecipe />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </RecipeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App; 