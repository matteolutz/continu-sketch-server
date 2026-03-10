import { useUser } from "./context/user";

const App = () => {
  const user = useUser();

  const href = "http://localhost:3000/oauth/start?receiver=session&redirect=http://localhost:5173";

  const logout = async () => {
    await fetch("http://localhost:3000/web/logout", {
      method: "POST",
      credentials: "include"
    });
    location.reload();
  };

  return <div>{user ? <div>Logged in as {user.name} (<button onClick={logout}>Logout</button>)</div> : <a href={href}>Login</a>}</div>
};

export default App;
