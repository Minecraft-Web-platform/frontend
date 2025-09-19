import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";

import RegistrationPage from "./modules/auth/pages/registration-page/registration.page";
import LoginPage from "./modules/auth/pages/login-page/login.page";
import AgreementPage from "./modules/auth/pages/agreement-page/agreement.page";
import LandingPage from "./modules/landing/landing.page";
import DownloadPage from "./modules/download/download.page";
import { RequireAuth } from "./shared/wraps/require-auth.wrap";
import GuestOnly from "./shared/wraps/guests-only.wrap";
import Profile from "./modules/profile/pages/profile.page";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
