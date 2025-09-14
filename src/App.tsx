import { BrowserRouter, Route, Routes } from "react-router";
import RegistrationPage from "./modules/auth/pages/registration-page/registration.page";
import LoginPage from "./modules/auth/pages/login-page/login.page";
import AgreementPage from "./modules/auth/pages/agreement.page";
import "./App.css";
import LandingPage from "./modules/landing/landing.page";
import DownloadPage from "./modules/download/download.page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index={true} element={<LandingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="agreement" element={<AgreementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
