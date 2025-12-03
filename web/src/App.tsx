import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { memo, useRef, useState } from "react";

interface IProps {}

const App: React.FC<IProps> = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const clientId = useRef<string>(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <>
      <GoogleOAuthProvider clientId={clientId.current}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <GoogleLogin
            text="continue_with"
            width={300}
            onSuccess={(token) => {
              console.log(token, "this is token");
              fetch("http://localhost:3000/auth/user/google", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token: token.credential,
                }),
              })
                .then((response) => {
                  return response.json();
                })
                .then((data) => {
                  setUser(JSON.stringify(data));
                })
                .catch((err) => {
                  console.log(err);
                  setError(err);
                });
            }}
          />
        </div>
      </GoogleOAuthProvider>
      <p>{user}</p>
      {error && <p style={{ color: "red" }}>{error.stringify()}</p>}
    </>
  );
};

export default memo(App);
