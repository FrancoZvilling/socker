// src/pages/FinalizarRegistroPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { activateTenantAfterRegistration } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { toast } from 'react-hot-toast';

const FinalizarRegistroPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [oobCode, setOobCode] = useState(null);
  const [email, setEmail] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('oobCode');
    if (code) {
      verifyPasswordResetCode(auth, code)
        .then((verifiedEmail) => {
          setEmail(verifiedEmail);
          setOobCode(code);
          setIsLoading(false);
        })
        .catch(() => {
          setError('El enlace de activación es inválido o ha expirado.');
          setIsLoading(false);
        });
    } else {
      setError('No se encontró un código de activación en el enlace.');
      setIsLoading(false);
    }
  }, [location]);

  // --- handleSubmit CORREGIDO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.'); return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.'); return;
    }

    setIsLoading(true);
    try {
      // 1. El usuario establece su contraseña
      await confirmPasswordReset(auth, oobCode, password);

      // 2. Inicia sesión automáticamente
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Llama a la función de servicio para activar el tenant en la base de datos
      await activateTenantAfterRegistration(user.uid);

      toast.success('¡Tu cuenta ha sido activada! Bienvenido.');
      
      // 4. Redirige a la página principal usando el navegador de React.
      // Ya no forzamos una recarga, lo que evita el error 404.
      // El AuthContext detectará el nuevo usuario y actualizará la app.
      navigate('/');

    } catch (err) {
      toast.error(err.message || 'No se pudo activar la cuenta. Intenta de nuevo.');
      console.error(err);
      setIsLoading(false); // Habilitamos el botón solo si hay un error
    }
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Verificando enlace...</div>;
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>;

  return (
    <div className="finish-registration-page">
      <div className="form-container">
        <h2>Finaliza tu Registro</h2>
        <p>Crea una contraseña segura para tu nueva cuenta.</p>
        <form onSubmit={handleSubmit}>
          <Input label="Nueva Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirmar Contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="primary" disabled={isLoading}>
            {isLoading ? 'Activando...' : 'Activar Cuenta y Establecer Contraseña'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FinalizarRegistroPage;