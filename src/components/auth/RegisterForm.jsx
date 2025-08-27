// src/components/auth/RegisterForm.jsx

import React, { useState } from 'react';
import { registerNewBusiness } from '../../services/authService';
import { toast } from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import './AuthForms.css';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await registerNewBusiness(formData.email, formData.password, formData.businessName);
      toast.success('¡Registro exitoso! Redirigiendo...');

      // Forzamos una recarga completa de la página después de 1 segundo
      // para dar tiempo al usuario a leer el toast de éxito.
      // Esto asegura que todos los contextos de la aplicación se reinicien
      // con la nueva información de la sesión.
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este correo electrónico ya está en uso.');
      } else {
        toast.error('Ocurrió un error durante el registro.');
      }
      console.error("Error de registro:", error);
      setIsLoading(false); // Solo volvemos a habilitar el botón si hubo un error
    }
    // No ponemos setIsLoading(false) aquí porque la página se recargará en caso de éxito
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Input label="Nombre del Negocio" name="businessName" value={formData.businessName} onChange={handleChange} />
      <Input label="Correo Electrónico (será tu usuario)" name="email" type="email" value={formData.email} onChange={handleChange} />
      <Input label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} />
      <Input label="Confirmar Contraseña" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
      <Button type="primary" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
      </Button>
    </form>
  );
};

export default RegisterForm;