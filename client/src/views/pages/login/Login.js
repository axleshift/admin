import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../../state/adminApi";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import Loader from "../../../components/Loader";

const Login = () => {
  const [data, setData] = useState({ identifier: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  // ✅ Use RTK Mutation Hook
  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.identifier || !data.password) {
      setErrorMessage("Both fields are required.");
      return;
    }

    try {
      const response = await loginUser(data).unwrap(); // Call API using RTK Query mutation
      console.log("Login Success:", response);

      // ✅ Store Tokens in LocalStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // ✅ Store User Data in SessionStorage
      const { id, name, username, role, email, department, permissions } =
        response.user;
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("username", username || "");
      sessionStorage.setItem("name", name || "");
      sessionStorage.setItem("email", email || "");
      sessionStorage.setItem("role", role || "");
      sessionStorage.setItem("department", department || "");
      sessionStorage.setItem("permissions", JSON.stringify(permissions || []));

      console.log(
        "Stored Permissions in sessionStorage:",
        sessionStorage.getItem("permissions")
      );

      // ✅ Redirect Based on Department
      switch (department.toLowerCase()) {
        case "administrative":
          navigate("/employeedash");
          break;
        case "hr":
          navigate("/hrdash");
          break;
        case "core":
          navigate("/coredash");
          break;
        case "finance":
          navigate("/financedash");
          break;  
        case "logistics":
          navigate("/logisticdash");
          break;
        default:
          setErrorMessage("Invalid department or access rights.");
      }
    } catch (err) {
      console.error("Login Failed:", err);
      setErrorMessage(err.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    {/* Display error message if login fails */}
                    {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

                    {/* Email/Username Input */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Email or Username"
                        autoComplete="email"
                        value={data.identifier}
                        onChange={(e) =>
                          setData({ ...data, identifier: e.target.value })
                        }
                        required
                      />
                    </CInputGroup>

                    {/* Password Input */}
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) =>
                          setData({ ...data, password: e.target.value })
                        }
                        required
                      />
                    </CInputGroup>

                    {/* Login Button */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4" disabled={isLoading}>
                          {isLoading ? "Logging in..." : "Login"}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <Link to="/forgotpass">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
