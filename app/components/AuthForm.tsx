// components/AuthForm.tsx - BUILD ERROR CORREGIDO
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Lock, User, Eye, EyeOff, Loader2, 
  CheckCircle, AlertTriangle, Chrome 
} from 'lucide-react';
import { authFunctions, helpers } from '../lib/firebase';
import toast from 'react-hot-toast';
import type { LucideIcon } from 'lucide-react';

interface AuthInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  error?: string;
  showPassword?: boolean;
  togglePassword?: () => void;
  disabled?: boolean;
}

const AuthInput = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  error,
  showPassword,
  togglePassword,
  disabled = false
}: AuthInputProps) => {
  return (
    <div className="relative">
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-12 pr-12 py-4 bg-black/40 backdrop-blur-xl border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-nora-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-white/20'
          }`}
        />
        {type === 'password' && togglePassword && (
          <button
            onClick={togglePassword}
            disabled={disabled}
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Success message component
const SuccessMessage = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
    <CheckCircle className="w-5 h-5 text-green-400" />
    <p className="text-green-400 text-sm">{message}</p>
  </div>
);

// Error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
    <AlertTriangle className="w-5 h-5 text-red-400" />
    <p className="text-red-400 text-sm">{message}</p>
  </div>
);

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  general: string;
}

export default function AuthForm() {
  const router = useRouter();
  
  // State
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  // Form handlers
  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email es requerido';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email no válido';
      isValid = false;
    }

    // Password validation (except for forgot password)
    if (!showForgotPassword) {
      if (!formData.password) {
        newErrors.password = 'Contraseña es requerida';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        isValid = false;
      }

      // Registration specific validations
      if (!isLogin) {
        if (!formData.name) {
          newErrors.name = 'Nombre es requerido';
          isValid = false;
        }
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ name: '', email: '', password: '', confirmPassword: '', general: '' });

    try {
      if (showForgotPassword) {
        // ✅ CORRECCIÓN: Forgot password flow
        await authFunctions.resetPassword(formData.email);
        setSuccessMessage('Se ha enviado un email para restablecer tu contraseña. Revisa tu bandeja de entrada.');
        toast.success('Email de recuperación enviado');
        setTimeout(() => {
          setShowForgotPassword(false);
          setSuccessMessage('');
        }, 3000);
      } else if (isLogin) {
        // ✅ CORRECCIÓN: Login flow mejorado
        await authFunctions.signIn(formData.email, formData.password);
        setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');
        toast.success('¡Bienvenido a NORA!');
        setTimeout(() => {
          router.push('/chat');
        }, 1500);
      } else {
        // ✅ CORRECCIÓN: Registration flow mejorado
        await authFunctions.signUp(formData.email, formData.password, formData.name);
        setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo...');
        toast.success('¡Bienvenido a NORA!');
        setTimeout(() => {
          router.push('/chat');
        }, 1500);
      }
    } catch (error: unknown) {
      const errorMessage = helpers.getErrorMessage(error);
      setErrors(prev => ({ ...prev, general: errorMessage }));
      toast.error(showForgotPassword ? 'Error al enviar email de recuperación' : 
                  isLogin ? 'Error al iniciar sesión' : 'Error al crear cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({ name: '', email: '', password: '', confirmPassword: '', general: '' });

    try {
      await authFunctions.signInWithGoogle();
      setSuccessMessage('¡Inicio de sesión con Google exitoso! Redirigiendo...');
      toast.success('¡Bienvenido a NORA!');
      setTimeout(() => {
        router.push('/chat');
      }, 1500);
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      
      // ✅ MANEJO ESPECÍFICO DE ERRORES GOOGLE
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = error.code as string;
        
        if (errorCode === 'auth/unauthorized-domain') {
          errorMessage = 'Dominio no autorizado. Contacta al administrador.';
        } else if (errorCode === 'auth/popup-closed-by-user') {
          errorMessage = 'Inicio de sesión cancelado';
        } else if (errorCode === 'auth/popup-blocked') {
          errorMessage = 'Popup bloqueado. Permite popups para este sitio.';
        } else if (errorCode === 'auth/cancelled-popup-request') {
          errorMessage = 'Solo se permite una ventana de inicio de sesión a la vez';
        }
      }

      setErrors(prev => ({ ...prev, general: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({ name: '', email: '', password: '', confirmPassword: '', general: '' });
    setSuccessMessage('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    resetForm();
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setIsLogin(true);
    resetForm();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {showForgotPassword ? 'Restablecer Contraseña' : isLogin ? 'Bienvenido de vuelta' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-400 font-light">
            {showForgotPassword 
              ? 'Ingresa tu email para restablecer tu contraseña'
              : isLogin 
                ? 'Ingresa tus credenciales para acceder'
                : 'Completa los datos para crear tu cuenta'
            }
          </p>
        </div>

        {/* Success Message */}
        {successMessage && <SuccessMessage message={successMessage} />}

        {/* General Error */}
        {errors.general && <ErrorMessage message={errors.general} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field (registration only) */}
          {!isLogin && !showForgotPassword && (
            <AuthInput
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleInputChange('name')}
              icon={User}
              error={errors.name}
              disabled={isLoading}
            />
          )}

          {/* Email field */}
          <AuthInput
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange('email')}
            icon={Mail}
            error={errors.email}
            disabled={isLoading}
          />

          {/* Password fields (not for forgot password) */}
          {!showForgotPassword && (
            <>
              <AuthInput
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange('password')}
                icon={Lock}
                error={errors.password}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              />

              {/* Confirm password (registration only) */}
              {!isLogin && (
                <AuthInput
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  icon={Lock}
                  error={errors.confirmPassword}
                  showPassword={showPassword}
                  disabled={isLoading}
                />
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-nora-primary to-nora-secondary text-white font-semibold rounded-xl hover:from-nora-primary/90 hover:to-nora-secondary/90 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>
              {isLoading 
                ? 'Procesando...' 
                : showForgotPassword 
                  ? 'Enviar Email' 
                  : isLogin 
                    ? 'Iniciar Sesión' 
                    : 'Crear Cuenta'
              }
            </span>
          </button>

          {/* Google Sign In (not for forgot password) */}
          {!showForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/20 text-gray-400">o continúa con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <Chrome className="w-5 h-5" />
                <span>Google</span>
              </button>
            </>
          )}

          {/* Action Links */}
          <div className="text-center space-y-2">
            {showForgotPassword ? (
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-nora-primary hover:text-nora-primary/80 transition-colors text-sm"
              >
                Volver al inicio de sesión
              </button>
            ) : (
              <>
                {isLogin && (
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-gray-400 hover:text-white transition-colors text-sm block w-full"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                
                <div className="flex items-center justify-center space-x-1 text-sm">
                  <span className="text-gray-400">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  </span>
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-nora-primary hover:text-nora-primary/80 transition-colors font-medium"
                  >
                    {isLogin ? 'Crear una' : 'Iniciar sesión'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}