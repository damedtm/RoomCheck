import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import './styles/index.css';
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_lk1vd8Mwx",
  client_id: "47bl8bnnokh7p1i4j7ha6f6ala",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "openid email",
};


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
