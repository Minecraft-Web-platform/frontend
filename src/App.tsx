import { BrowserRouter, Route, Routes } from "react-router";
import RegistrationPage from "./modules/auth/pages/registration.page";
import LoginPage from "./modules/auth/pages/login.page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
