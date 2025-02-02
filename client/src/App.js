import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import api from './util/apislice';
import usePersistentLogin from './components/hooks/PersistlentLogin';
import './scss/style.scss';
import Loader from './components/Loader';
import ActivityTracker from './util/ActivityTracker';
import NotificationToast from './views/pages/scene/notification'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./views/pages/login/Login'));
const SystemLogin = React.lazy(() => import('./views/pages/login/systemlogin'));
const Logout = React.lazy(() => import('./views/pages/logout/index'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const Forgotpass = React.lazy(() => import('./views/pages/profile/forgotpass'));
const Resetpass = React.lazy(() => import('./views/pages/profile/resetpass'));

// ✅ Fix: Move `useLocation()` inside a component that is inside `BrowserRouter`
const RouterWrapper = () => {
  const location = useLocation(); // Now it's safe to use inside `BrowserRouter`

  return (
    <>
      {/* Track page navigation */}
      <ActivityTracker path={location.pathname} />

      <NotificationToast />
      <Routes>
        <Route exact path="/login" name="Login Page" element={<Login />} />
        <Route exact path="/systemlogin" name="System Login Page" element={<SystemLogin />} />
        <Route exact path="/logout" name="Logout" element={<Logout />} />
        <Route exact path="/forgotpass" name="Forgot Password" element={<Forgotpass />} />
        <Route exact path="/resetpass/:id/:token" name="Reset Password" element={<Resetpass />} />
        <Route exact path="/404" name="Page 404" element={<Page404 />} />
        <Route exact path="/500" name="Page 500" element={<Page500 />} />
        <Route path="*" name="Home" element={<DefaultLayout />} />
      </Routes>
    </>
  );
};

const App = () => {
  usePersistentLogin();
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.changeState.theme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const response = await api.get('/client/user');
          if (response.status === 200) {
            setLoading(false);
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }
    if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [isColorModeSet, setColorMode, storedTheme]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
      <BrowserRouter>
        <RouterWrapper />
      </BrowserRouter>
    </Suspense>
  );
};

export default App;
