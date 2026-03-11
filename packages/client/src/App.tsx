import { BrowserRouter } from "react-router";
import { useUser } from "./context/user";
import { WebSocketProvider } from "./context/ws";
import { getApiUrl, getOauthStart } from "./utils/api";
import { Routes, Route } from "react-router";
import { redirect } from "react-router";
import { Navigate } from "react-router";
import { Link } from "react-router";
import HandoffPage from "./pages/Handoff";

const App = () => {
  const user = useUser();

  const logout = async () => {
    await fetch(getApiUrl("logout"), {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  };

  return (
    <BrowserRouter>
      {user ? (
        <WebSocketProvider user={user}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <div>
                  Logged in as {user.name} (
                  <button onClick={logout}>Logout</button>)
                </div>
              }
            ></Route>
            <Route path="/handoff/:id" element={<HandoffPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </WebSocketProvider>
      ) : (
        <Routes>
          <Route path="/auth" element={<a href={getOauthStart()}>Login</a>} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
