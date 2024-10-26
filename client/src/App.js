import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import axios from 'axios';
import './scss/style.scss';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Logout = React.lazy(() => import('./views/pages/logout/index'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const Forgotpass = React.lazy(() => import('./views/pages/profile/forgotpass'));
const Resetpass = React.lazy(() => import('./views/pages/profile/resetpass'));

// Component to log user activity
const LogActivity = () => {
  const location = useLocation();

  useEffect(() => {
      const logUserActivity = async () => {
          try {
              // This should point to a valid route, adjust as needed
              await axios.post('http://localhost:5053/general/log-activity', {
                  url: window.location.href,
              }, { withCredentials: true });
          } catch (error) {
              console.error('Error logging user activity:', error);
          }
      };

      logUserActivity();
  }, [location]);

  return null; // This component doesn't render anything
};

const App = () => {
    const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
    const storedTheme = useSelector((state) => state.changeState.theme);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
        const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
        if (theme) {
            setColorMode(theme);
        }

        if (isColorModeSet()) {
            return;
        }

        setColorMode(storedTheme);
    }, [isColorModeSet, setColorMode, storedTheme]);

    return (
        <BrowserRouter>
            <Suspense
                fallback={
                    <div className="pt-3 text-center">
                        <CSpinner color="primary" variant="grow" />
                    </div>
                }
            >
                <LogActivity /> {/* Log the user activity */}
                <Routes>
                    <Route exact path="/login" name="Login Page" element={<Login />} />
                    <Route exact path="/logout" name="Logout" element={<Logout />} />
                    <Route exact path="/forgotpass" name="Forgot Password" element={<Forgotpass />} />
                    <Route exact path="/resetpass/:id/:token" name="Reset Password" element={<Resetpass />} />
                    <Route exact path="/register" name="Register Page" element={<Register />} />
                    <Route exact path="/404" name="Page 404" element={<Page404 />} />
                    <Route exact path="/500" name="Page 500" element={<Page500 />} />
                    <Route path="*" name="Home" element={<DefaultLayout />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default App;
