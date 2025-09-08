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
        <p className="mt-2 text-sm text-red-400 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const SuccessMessage = ({ message }: { message: string }) => {
  return (
    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <p className="text-green-400 text-sm">{message}</p>
      </div>
    </div>
  );
};

const SocialButton = ({ 
  icon: Icon, 
  provider, 
  onClick, 
  disabled 
}: {
  icon: LucideIcon;
  provider: string;
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className="w-full p-4 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-xl text-white transition-all duration-300 flex items-center justify-center space-x-3"
    >
      <Icon className="w-5 h-5" />
      <span>Continuar con {provider}</span>
    </button>
  );
};

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '', general: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido';
      isValid = false;
    }

    // Password validation (skip for forgot password)
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
        // ✅ CORRECCIÓN: Forgot password flow sin acceder a .error
        try {
          await authFunctions.resetPassword(formData.email);
          setSuccessMessage('Se ha enviado un email para restablecer tu contraseña. Revisa tu bandeja de entrada.');
          toast.success('Email de recuperación enviado');
          setTimeout(() => {
            setShowForgotPassword(false);
            setSuccessMessage('');
          }, 3000);
        } catch (error: any) {
          const errorMessage = helpers.getErrorMessage(error);
          setErrors({ ...errors, general: errorMessage });
          toast.error('Error al enviar email de recuperación');
        }
      } else if (isLogin) {
        // ✅ CORRECCIÓN: Login flow mejorado
        try {
          await authFunctions.signIn(formData.email, formData.password);
          setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');
          toast.success('¡Bienvenido a NORA!');
          setTimeout(() => {
            router.push('/chat');
          }, 1500);
        } catch (error: any) {
          const errorMessage = helpers.getErrorMessage(error);
          setErrors({ ...errors, general: errorMessage });
          toast.error('Error al iniciar sesión');
        }
      } else {
        // ✅ CORRECCIÓN: Registration flow mejorado
        try {
          await authFunctions.signUp(formData.email, formData.password, formData.name);
          setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo...');
          toast.success('¡Bienvenido a NORA!');
          setTimeout(() => {
            router.push('/chat');
          }, 1500);
        } catch (error: any) {
          const errorMessage = helpers.getErrorMessage(error);
          setErrors({ ...errors, general: errorMessage });
          toast.error('Error al crear cuenta');
        }
      }
    } catch (error: any) {
      const errorMessage = helpers.getErrorMessage(error);
      setErrors({ ...errors, general: errorMessage });
      toast.error('Error inesperado');
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
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // ✅ MANEJO ESPECÍFICO DE ERRORES GOOGLE
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error?.code === 'auth/unauthorized-domain') {
        errorMessage = 'Dominio no autorizado. Contacta al administrador.';
      } else if (error?.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (error?.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Permite popups para este sitio';
      } else {
        errorMessage = helpers.getErrorMessage(error);
      }
      
      setErrors({ ...errors, general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({ name: '', email: '', password: '', confirmPassword: '', general: '' });
    setSuccessMessage('');
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setFormData({ ...formData, password: '', confirmPassword: '' });
    setErrors({ name: '', email: '', password: '', confirmPassword: '', general: '' });
    setSuccessMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-black/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2 font-lastica">
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
                  showPassword={showConfirmPassword}
                  togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                />
              )}
            </>
          )}

          {/* General error */}
          {errors.general && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.general}</span>
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-nora-primary hover:bg-nora-primary/80 disabled:bg-nora-primary/50 disabled:cursor-not-allowed text-white rounded-xl font-light transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>
                {showForgotPassword 
                  ? 'Enviar email' 
                  : isLogin 
                    ? 'Iniciar Sesión' 
                    : 'Crear Cuenta'
                }
              </span>
            )}
          </button>

          {/* Social login (not for forgot password) */}
          {!showForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/60 text-gray-400">o</span>
                </div>
              </div>

              <SocialButton
                icon={Chrome}
                provider="Google"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              />
            </>
          )}

          {/* Forgot password & Toggle mode */}
          <div className="space-y-4">
            {/* Forgot password (login only) */}
            {isLogin && !showForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Back to login (forgot password) */}
            {showForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  disabled={isLoading}
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            )}

            {/* Toggle between login/register */}
            {!showForgotPassword && (
              <div className="text-center">
                <span className="text-gray-400 text-sm">
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </span>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-2 text-nora-primary hover:text-nora-primary/80 text-sm font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}