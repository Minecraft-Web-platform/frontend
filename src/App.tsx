import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { PropagateLoader } from "react-spinners";
import "./App.css";
import { RequireAuth } from "./shared/wraps/require-auth.wrap";
import GuestOnly from "./shared/wraps/guests-only.wrap";
import { GlobalToastProvider } from "./shared/components/global-toast/GlobalToastProvider";

const RegistrationPage = React.lazy(() => import("./modules/auth/pages/registration-page/registration.page"));
const LoginPage = React.lazy(() => import("./modules/auth/pages/login-page/login.page"));
const ResetPasswordPage = React.lazy(() => import("./modules/auth/pages/reset-password-page/reset-password.page"));
const AgreementPage = React.lazy(() => import("./modules/auth/pages/agreement-page/agreement.page"));
const LandingPage = React.lazy(() => import("./modules/landing/landing.page"));
const DownloadPage = React.lazy(() => import("./modules/download/download.page"));
const Profile = React.lazy(() => import("./modules/profile/pages/profile.page"));
const AchievementsAdminPage = React.lazy(() => import("./modules/admin/pages/achievements-admin.page").then(module => ({ default: module.AchievementsAdminPage })));
const CalendarPage = React.lazy(() => import("./modules/profile/pages/calendar.page").then(module => ({ default: module.CalendarPage })));
const PlayersPage = React.lazy(() => import("./modules/players/pages/players.page"));
const PlayerProfile = React.lazy(() => import("./modules/players/pages/player-profile.page"));
const NewsPage = React.lazy(() => import("./modules/news/pages/news.page"));
const TechSupportPage = React.lazy(() => import("./modules/tech-support/pages/tech-support.page"));
const EmailConfirmationPage = React.lazy(() => import("./modules/auth/pages/email-confirmation/email-confirmation.page"));
const NewsDetailsPage = React.lazy(() => import("./modules/news/pages/news-details.page"));
const NotFoundPage = React.lazy(() => import("./modules/not-found/pages/not-found.page"));
const StatesListPage = React.lazy(() => import("./modules/states").then(module => ({ default: module.StatesListPage })));
const StateDetailPage = React.lazy(() => import("./modules/states").then(module => ({ default: module.StateDetailPage })));
const NationalBankPage = React.lazy(() => import("./modules/states").then(module => ({ default: module.NationalBankPage })));
const CitiesListPage = React.lazy(() => import("./modules/states").then(module => ({ default: module.CitiesListPage })));
const CityDetailPage = React.lazy(() => import("./modules/states").then(module => ({ default: module.CityDetailPage })));
const EconomyHubPage = React.lazy(() => import("./modules/economy").then(module => ({ default: module.EconomyHubPage })));
const CompanyDetailPage = React.lazy(() => import("./modules/economy").then(module => ({ default: module.CompanyDetailPage })));

function App() {
  const fallbackLoader = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#1f2937' }}>
      <PropagateLoader color="#60a5fa" />
    </div>
  );

  return (
    <BrowserRouter>
      <GlobalToastProvider>
        <Suspense fallback={fallbackLoader}>
          <Routes>
          <Route path="/" index={true} element={<LandingPage />} />

          <Route
            path="/download"
            element={
              <RequireAuth>
                <DownloadPage />
              </RequireAuth>
            }
          />
          <Route
            path="/registration"
            element={
              <GuestOnly redirectTo="/profile">
                <RegistrationPage />
              </GuestOnly>
            }
          />
          <Route
            path="/login"
            element={
              <GuestOnly redirectTo="/profile">
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestOnly redirectTo="/profile">
                <ResetPasswordPage />
              </GuestOnly>
            }
          />

          <Route
            path="/news"
            element={
              <RequireAuth>
                <NewsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/news/:id"
            element={
              <RequireAuth>
                <NewsDetailsPage />
              </RequireAuth>
            }
          />

          <Route path="/agreement" element={<AgreementPage />} />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile></Profile>
              </RequireAuth>
            }
          />

          <Route
            path="/calendar"
            element={
              <RequireAuth>
                <CalendarPage />
              </RequireAuth>
            }
          />

          <Route
            path="/email-confirmation"
            element={
              <RequireAuth>
                <EmailConfirmationPage />
              </RequireAuth>
            }
          />

          <Route
            path="/players"
            element={
              <RequireAuth>
                <PlayersPage />
              </RequireAuth>
            }
          />

          <Route
            path="/players/:username"
            element={
              <RequireAuth>
                <PlayerProfile />
              </RequireAuth>
            }
          />

          <Route
            path="/states"
            element={
              <RequireAuth>
                <StatesListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/states/:id"
            element={
              <RequireAuth>
                <StateDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/states/:id/national-bank"
            element={
              <RequireAuth>
                <NationalBankPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cities"
            element={
              <RequireAuth>
                <CitiesListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cities/:id"
            element={
              <RequireAuth>
                <CityDetailPage />
              </RequireAuth>
            }
          />

          <Route
            path="/tech-support"
            element={
              <RequireAuth>
                <TechSupportPage />
              </RequireAuth>
            }
          />

          <Route
            path="/economy"
            element={
              <RequireAuth>
                <EconomyHubPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bank"
            element={<Navigate to="/economy?tab=bank" replace />}
          />
          <Route
            path="/currencies"
            element={<Navigate to="/economy?tab=currencies" replace />}
          />
          <Route
            path="/companies"
            element={<Navigate to="/economy?tab=companies" replace />}
          />
          <Route
            path="/companies/:id"
            element={
              <RequireAuth>
                <CompanyDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange"
            element={<Navigate to="/economy?tab=exchange" replace />}
          />
          <Route
            path="/properties"
            element={<Navigate to="/economy?tab=properties" replace />}
          />
          <Route
            path="/admin/achievements"
            element={
              <RequireAuth>
                <AchievementsAdminPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </GlobalToastProvider>
    </BrowserRouter>
  );
}

export default App;
