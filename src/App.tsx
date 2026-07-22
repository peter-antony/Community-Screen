import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommunicationProvider } from './context/CommunicationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CommunityListPage } from './pages/CommunityListPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ChatPage } from './pages/ChatPage';
import { CallPage } from './pages/CallPage';
import { NetworkConstellationPage } from './pages/NetworkConstellationPage';
import { ExploreCommunitiesPage } from './pages/ExploreCommunitiesPage';
import { CommunityMapPage } from './pages/CommunityMapPage';
import { CommunityDetailsPage } from './pages/CommunityDetailsPage';

// Security Route wrappers
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/network" replace /> : <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      {/*<Route path="/" element={<LandingPage />} />*/}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Console Workspace (Wrapped in AppLayout) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommunityListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore-communities"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ExploreCommunitiesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community-map"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommunityMapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/call"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CallPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/network"
        element={
          <ProtectedRoute>
            <NetworkConstellationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community-details/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommunityDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect wildcards */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CommunicationProvider>
            <AppContent />
          </CommunicationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
