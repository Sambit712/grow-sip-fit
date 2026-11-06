import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { EducationPage } from './pages/EducationPage';
import { PaymentHelpPage } from './pages/PaymentHelpPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/assess" element={<AssessmentPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/payment-help" element={<PaymentHelpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
