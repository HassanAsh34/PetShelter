import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AnimalList from './pages/animals/AnimalList';
import AnimalDetails from './pages/animals/AnimalDetails';
import { AdminDashboard, AdminUsers, AdminShelters } from './pages/admin';
import UserDetailsPage from './pages/admin/UserDetailsPage';
import Shelters from './pages/admin/Shelters';
import ShelterDetails from './pages/admin/ShelterDetails';
import AddShelterPage from './pages/admin/AddShelterPage';
import Categories from './pages/admin/Categories';
import AddCategoryPage from './pages/admin/AddCategoryPage';
import EditCategoryPage from './pages/admin/EditCategoryPage';
import CategoryDetails from './pages/admin/CategoryDetails';

// Protected Route Component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected Profile Route Component
const ProtectedProfileRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/profile' }} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<AnimalList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/animals/:id" element={<AnimalDetails />} />
          <Route
            path="/profile"
            element={
              <ProtectedProfileRoute>
                <UserDetailsPage />
              </ProtectedProfileRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/shelters"
            element={
              <ProtectedAdminRoute>
                <Shelters />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/shelters/add"
            element={
              <ProtectedAdminRoute>
                <AddShelterPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute>
                <Categories />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories/add"
            element={
              <ProtectedAdminRoute>
                <AddCategoryPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories/edit/:categoryId"
            element={
              <ProtectedAdminRoute>
                <EditCategoryPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/shelters/:id"
            element={
              <ProtectedAdminRoute>
                <ShelterDetails />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users/:id/:role"
            element={
              <ProtectedAdminRoute>
                <UserDetailsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories/:categoryId"
            element={
              <ProtectedAdminRoute>
                <CategoryDetails />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App; 