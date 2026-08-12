import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import "./App.css";
import { RequireAuth } from "./shared/wraps/require-auth.wrap";

import RegistrationPage from "./modules/auth/pages/registration-page/registration.page";
import LoginPage from "./modules/auth/pages/login-page/login.page";
import ResetPasswordPage from "./modules/auth/pages/reset-password-page/reset-password.page";
import AgreementPage from "./modules/auth/pages/agreement-page/agreement.page";
import LandingPage from "./modules/landing/landing.page";
import DownloadPage from "./modules/download/download.page";
import GuestOnly from "./shared/wraps/guests-only.wrap";
import Profile from "./modules/profile/pages/profile.page";
import { CalendarPage } from './modules/profile/pages/calendar.page';
import PlayersPage from "./modules/players/pages/players.page";
import PlayerPassport from "./modules/players/pages/player-passport.page";
import NewsPage from "./modules/news/pages/news.page";
import TechSupportPage from "./modules/tech-support/pages/tech-support.page";
import EmailConfirmationPage from "./modules/auth/pages/email-confirmation/email-confirmation.page";
import NewsDetailsPage from "./modules/news/pages/news-details.page";
import NotFoundPage from "./modules/not-found/pages/not-found.page";
import {
  StatesListPage,
  StateDetailPage,
  NationalBankPage,
  CitiesListPage,
  CityDetailPage,
} from "./modules/states";
import { EconomyHubPage } from "./modules/economy";

function App() {
  return (
    <BrowserRouter>
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
              <PlayerPassport />
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
          path="/exchange"
          element={<Navigate to="/economy?tab=exchange" replace />}
        />
        <Route
          path="/properties"
          element={<Navigate to="/economy?tab=properties" replace />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
