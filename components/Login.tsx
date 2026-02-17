import React, { useState } from 'react';
import { apiService } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await apiService.login(username, password);

      // Guardar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role || 'User');
      localStorage.setItem('userName', user.nombre || username);
      localStorage.setItem('userPermissions', JSON.stringify(user.permissions || []));

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      onLoginSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión. Por favor, intenta nuevamente.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="card">
          {/* Header Section with Illustration */}
          <div className="card-header-illustration text-center">
            <div className="illustration-content">
              <div className="mb-3">
                <img src="/images/logo.png" alt="ADHSOFT SPORT" className="login-logo" />
              </div>
              <h3 className="text-white mb-1">Bienvenido al Sistema</h3>
              <p className="text-white-50 small mb-0">ADHSOFT SPORT - Gestión Deportiva</p>
            </div>
          </div>

          {/* Login Section */}
          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <div className="input-group-custom">
                  <span className="input-icon">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="Email o Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="input-group-custom">
                  <span className="input-icon">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control-custom"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label text-muted small" htmlFor="rememberMe">
                    Recordarme
                  </label>
                </div>
                <a href="#" className="text-primary small" onClick={(e) => e.preventDefault()}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Cargando...
                    </>
                  ) : (
                    'INGRESAR'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="card-footer text-center py-3 bg-transparent border-0">
            <small className="text-muted">designed by ADHSOFT © 2026</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
