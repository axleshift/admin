import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";
import "./scss/style.scss";


const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));
const Login = React.lazy(() => import("./views/pages/login/Login"));
const SystemLogin = React.lazy(() => import("./views/pages/login/systemlogin"));
const Logout = React.lazy(() => import("./views/pages/logout/index"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));
const Forgotpass = React.lazy(() => import("./views/pages/profile/forgotpass"));
const Resetpass = React.lazy(() => import("./views/pages/profile/resetpass"));
const OTP = React.lazy(()=> import ("./views/pages/profile/OTP"));
const TermsAccept = React.lazy(()=> import('./views/pages/LegalPanel/agreement/termandaccept'));
const ComplainsExternalEmployees = React.lazy(() => import('./views/pages/LegalPanel/complains/employeesexternalcomplain'));
const UploadIR = React.lazy(()=> import ('./views/pages/LegalPanel/uploadIncident'))
const AppContent = () => {
  const { isColorModeSet, setColorMode } = useColorModes("coreui-free-react-admin-template-theme");
  const storedTheme = useSelector((state) => state.changeState.theme);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
    const theme = urlParams.get("theme")?.match(/^[A-Za-z0-9\s]+/)?.[0];
  
    if (theme) {
      setColorMode(theme);
    }
  
    if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [isColorModeSet, setColorMode, storedTheme]);
  

  const userLog = ()  =>{
    const keys = ['accesstoken', 'refresh', 'userid', 'username', 'userrole', 'department'];
  return keys.every(key => localStorage.getItem(key) !== null);
};

  


  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <Routes>
      <Route path="/login" element={!userLog() && <Login />} />
        <Route path="/OTP" element={<OTP />} />
        <Route path="/systemlogin" element={<SystemLogin />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgotpass" element={<Forgotpass />} />
        <Route path="/resetpass/:id/:token" element={<Resetpass />} />
        <Route path="/termsaccept/:id/:token" element={<TermsAccept />} />
        <Route path="/employeesExternalComplain/:id/:token" element={<ComplainsExternalEmployees/>} />
        <Route path='/uploadIncident/:id/:token'element={<UploadIR/>}/>
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
        <Route path="*" element={<DefaultLayout />} />
      </Routes>
    </Suspense>
  );
};


const App = () => {
  // Check if user is authenticated by looking for token in localStorage or session
  const isAuthenticated = () => {
    // Assuming you store the authentication token in localStorage
    return localStorage.getItem('accesstoken') !== null;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;