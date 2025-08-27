// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { login, resetPassword } from '../../services/authService';
import { toast } from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import Swal from 'sweetalert2';
import './AuthForms.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido de nuevo!');
      onLoginSuccess(); // Cierra el modal
    } catch (error) {
      toast.error('Credenciales incorrectas o el usuario no existe.');
      console.error("Error de login:", error.code);
    }
    setIsLoading(false);
  };

  const handlePasswordReset = () => {
    Swal.fire({
      title: 'Reestablecer Contraseña',
      text: 'Ingresa tu correo electrónico y te enviaremos un enlace para reestablecer tu contraseña.',
      input: 'email',
      inputPlaceholder: 'tu@email.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar enlace',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (emailInput) => {
        return resetPassword(emailInput)
          .then(() => {
            return emailInput;
          })
          .catch(err => {
            Swal.showValidationMessage(`Error: ${err.message}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Revisa tu correo!',
          text: `Se ha enviado un enlace a ${result.value} para reestablecer tu contraseña.`,
          icon: 'success'
        });
      }
    });
  };

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <Input label="Correo Electrónico" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Contraseña" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="forgot-password">
        <button type="button" onClick={handlePasswordReset}>¿Olvidaste tu contraseña?</button>
      </div>
      <Button type="primary" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  );
};

export default LoginForm;