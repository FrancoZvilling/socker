// src/components/auth/AuthModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import LoginForm from './LoginForm'; // <-- IMPORTA
import RegisterForm from './RegisterForm'; // <-- IMPORTA
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [view, setView] =useState('login');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === 'login' ? 'Iniciar Sesión' : 'Crear una Cuenta'}>
      <div className="auth-modal-content">
        {view === 'login' ? (
          <>
            <LoginForm onLoginSuccess={onClose} />
            <div className="auth-modal-switch">
              <span>¿No tienes una cuenta?</span>
              <button onClick={() => setView('register')}>Regístrate</button>
            </div>
          </>
        ) : (
          <>
            <RegisterForm onRegisterSuccess={onClose} />
            <div className="auth-modal-switch">
              <span>¿Ya tienes una cuenta?</span>
              <button onClick={() => setView('login')}>Inicia Sesión</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;