import { useState } from "react";
import "./Login.css";
import { Alert } from "react-bootstrap";


function Login(
  {
    motdepasse,
    setMotdepasse,
    email,
    setEmail,
    handleSubmit,
    message

  }
) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);




  const handleForgotPassword = () => {
    alert("indisponible pour le moment");
  };


  return (
    <div className="page">

      {/* Cercles décoratifs */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>
      <div className="circle circle-4"></div>



      {/* =========================
          FORMULAIRE
      ========================== */}
      <main className="content">

        <div className="login-card">

          {/* Icône utilisateur */}
          <div className="user-icon">
            <svg
              viewBox="0 0 24 24"
              width="42"
              height="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle
                cx="12"
                cy="8"
                r="3.5"
              />

              <path
                d="M5.5 19c.8-3.2 3.2-5 6.5-5s5.7 1.8 6.5 5"
              />
            </svg>
          </div>

          {/* Titre Login */}
          <h2> CTM SK239</h2>

          <p className="welcome">
            Veillez entrer votre identifiant
          </p>

         {message && <Alert variant="danger">
            {message}
          </Alert>}

          {/* =========================
              FORM
          ========================== */}
          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div className="input-box">

              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="currentColor"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path
                  d="M4 21c.6-4 3.2-6 8-6s7.4 2 8 6"
                />
              </svg>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                name="username"
                placeholder="email"
                autoComplete="username"
                required
              />

            </div>

            {/* Password */}
            <div className="input-box">

              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="currentColor"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />

                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                />

                <circle
                  cx="12"
                  cy="15"
                  r="1.2"
                  fill="white"
                />
              </svg>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Mot de passe"
                autoComplete="current-password"
                required
                value={motdepasse}
                onChange={e => setMotdepasse(e.target.value)}
              />

              {/* Afficher / cacher le mot de passe */}
              <button
                type="button"
                className="eye-button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? "●" : "○"}
              </button>

            </div>

            {/* =========================
                REMEMBER / FORGOT
            ========================== */}
            <div className="options">

              <label className="remember">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                />

                <span>
                  Se souvenir de moi
                </span>

              </label>

              <button
                type="button"
                className="forgot"
                onClick={handleForgotPassword}
              >
                Mot de passe oublié?
              </button>

            </div>

            {/* =========================
                SIGN IN
            ========================== */}
            <button
              className="login-button"
              type="submit"
            >
              Se connecter
            </button>

          </form>


        </div>

      </main>



    </div>
  );
}

export default Login;
