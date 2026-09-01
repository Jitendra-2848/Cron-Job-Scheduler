import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CronProvider } from './context/CronContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import CronJobs from './pages/CronJobs';
import CreateCron from './pages/CreateCron';
import HistoryPage from './pages/History';
import AnalyticsPage from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CronProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
          </Routes>
        </BrowserRouter>
      </CronProvider>
    </ThemeProvider>
  );
};

export default App;