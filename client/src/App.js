import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";
import { trackActivity } from './utils/trackActivity.js';
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
const OTP = React.lazy(()=> import ("./views/pages/profile/OTP"))

const App = () => {
    const { isColorModeSet, setColorMode } = useColorModes("coreui-free-react-admin-template-theme");
    const storedTheme = useSelector((state) => state.changeState.theme);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
        const theme = urlParams.get("theme")?.match(/^[A-Za-z0-9\s]+/)[0];

        if (theme) {
            setColorMode(theme);
        }

        if (!isColorModeSet()) {
            setColorMode(storedTheme);
        }

        // Tracking user activity
        const userId = sessionStorage.getItem('userid') 
        const name = sessionStorage.getItem('name') 
        const department = sessionStorage.getItem('department') 
        const role = sessionStorage.getItem('role') 
        trackActivity({
            userId: userId,
            name: name,
            department: department,
            role: role,
            actionType: 'Page Visit',
            actionDescription: `Visited ${window.location.pathname}`
        });
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
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/OTP" element={<OTP />} />
                    <Route path="/systemlogin" element={<SystemLogin />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/forgotpass" element={<Forgotpass />} />
                    <Route path="/resetpass/:id/:token" element={<Resetpass />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/404" element={<Page404 />} />
                    <Route path="/500" element={<Page500 />} />
                    <Route path="*" element={<DefaultLayout />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default App;
