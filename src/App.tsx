import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { RequireAuth } from "./shared/wraps/require-auth.wrap";

import RegistrationPage from "./modules/auth/pages/registration-page/registration.page";
import LoginPage from "./modules/auth/pages/login-page/login.page";
import AgreementPage from "./modules/auth/pages/agreement-page/agreement.page";
import LandingPage from "./modules/landing/landing.page";
import DownloadPage from "./modules/download/download.page";
import GuestOnly from "./shared/wraps/guests-only.wrap";
import Profile from "./modules/profile/pages/profile.page";
import PlayersPage from "./modules/players/pages/players.page";
import PlayerPassport from "./modules/players/pages/player-passport.page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index={true} element={<LandingPage />} />
        <Route path="/download" element={<DownloadPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
