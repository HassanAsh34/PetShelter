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
import AdoptionHistory from './pages/adopter/AdoptionHistory';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffPetsList from './pages/staff/StaffPetsList';
import StaffAdoptionRequests from './pages/staff/StaffAdoptionRequests';
import AddPetPage from './pages/staff/AddPetPage';
import AdminChat from './pages/admin/Chat';
import TalkToAdmin from './pages/user/TalkToAdmin';

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

// Protected Adopter Route Component
const ProtectedAdopterRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdopter } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/adoption-history' }} replace />;
  }
  
  if (!isAdopter) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected Staff Route Component
const ProtectedStaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isShelterStaff } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/staff/dashboard' }} replace />;
  }
  
  if (!isShelterStaff) {
    return <Navigate to="/" replace />;
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
            path="/adoption-history"
            element={
              <ProtectedAdopterRoute>
                <AdoptionHistory />
              </ProtectedAdopterRoute>
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
            path="/admin/users/:id/:role"
            element={
              <ProtectedAdminRoute>
                <UserDetailsPage />
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
            path="/admin/shelters/:id"
            element={
              <ProtectedAdminRoute>
                <ShelterDetails />
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
            path="/admin/categories/edit/:id"
            element={
              <ProtectedAdminRoute>
                <EditCategoryPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories/:id"
            element={
              <ProtectedAdminRoute>
                <CategoryDetails />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <ProtectedAdminRoute>
                <AdminChat />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedStaffRoute>
                <StaffDashboard />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/pets"
            element={
              <ProtectedStaffRoute>
                <StaffPetsList />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/adoption-requests"
            element={
              <ProtectedStaffRoute>
                <StaffAdoptionRequests />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/pets/add"
            element={
              <ProtectedStaffRoute>
                <AddPetPage />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/talk-to-admin"
            element={
              <ProtectedAdopterRoute>
                <TalkToAdmin />
              </ProtectedAdopterRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App; 