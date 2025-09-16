import Modal from '../common/Modal';
import LoginForm from './LoginForm';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
 

  return (
    
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Sesión">
      <div className="auth-modal-content">
        <LoginForm onLoginSuccess={onClose} />
      </div>
    </Modal>
  );
};

export default AuthModal;