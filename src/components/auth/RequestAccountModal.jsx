// src/components/auth/RequestAccountModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { requestNewAccount } from '../../services/authService';
import './AuthForms.css';

const RequestAccountModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    confirmEmail: '',
    whatsapp: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email !== formData.confirmEmail) {
      toast.error('Los correos electrónicos no coinciden.'); return;
    }
    if (!formData.businessName.trim() || !formData.whatsapp.trim() || !formData.email.trim()) {
      toast.error('Por favor, complete todos los campos.'); return;
    }

    setIsLoading(true);
    try {
      await requestNewAccount(formData);
      onClose();
      Swal.fire({
        title: '¡Solicitud Enviada!',
        html: `Hemos recibido tu solicitud.<br/>Nos pondremos en contacto contigo a través de <strong>${formData.whatsapp}</strong> o <strong>${formData.email}</strong> para coordinar el pago y la activación.`,
        icon: 'success',
        confirmButtonText: '¡Entendido!'
      });
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error al enviar la solicitud.');
      console.error("Error en solicitud de cuenta:", error);
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar una Cuenta Nueva">
      <form onSubmit={handleSubmit} className="auth-form">
        <Input label="Nombre del Negocio" name="businessName" value={formData.businessName} onChange={handleChange} />
        <Input label="Correo Electrónico de Contacto" name="email" type="email" value={formData.email} onChange={handleChange} />
        <Input label="Confirmar Correo Electrónico" name="confirmEmail" type="email" value={formData.confirmEmail} onChange={handleChange} />
        <Input label="Número de WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Ej: +54 9 11 22334455" />
        <Button type="primary" disabled={isLoading}>
          {isLoading ? 'Enviando Solicitud...' : 'Enviar Solicitud'}
        </Button>
      </form>
    </Modal>
  );
};

export default RequestAccountModal;