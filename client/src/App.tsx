import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CronProvider } from './context/CronContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageSkeleton } from './components/Skeleton';

// Code-split route chunks for ultra-fast initial bundle loading
const Home = lazy(() => import('./pages/Home'));
const CronJobs = lazy(() => import('./pages/CronJobs'));
const CreateCron = lazy(() => import('./pages/CreateCron'));
const HistoryPage = lazy(() => import('./pages/History'));
const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CronProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Application Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/cron-jobs" element={<CronJobs />} />
                    <Route path="/create-cron" element={<CreateCron />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CronProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;