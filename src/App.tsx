import { BrowserRouter, Route, Routes } from "react-router";
import RegistrationPage from "./modules/auth/pages/registration.page";
import LoginPage from "./modules/auth/pages/login.page";
import AgreementPage from "./modules/auth/pages/agreement.page";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="agreement" element={<AgreementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
