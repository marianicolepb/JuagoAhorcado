import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (displayName.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
      Alert.alert('¡Éxito!', 'Cuenta creada correctamente', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#064e3b', '#065f46', '#047857']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete al juego de ahorcado</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Display Name Input */}
            <View style={styles.inputContainer}>
              <User color="#34d399" size={22} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                placeholderTextColor="#9ca3af"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Mail color="#34d399" size={22} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock color="#34d399" size={22} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Contraseña"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="#9ca3af" size={20} />
                ) : (
                  <Eye color="#9ca3af" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Lock color="#34d399" size={22} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#9ca3af" size={20} />
                ) : (
                  <Eye color="#9ca3af" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.loginHighlight}>Inicia sesión aquí</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(6,95,70,0.9)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ecfdf5',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#a7f3d0',
    textAlign: 'center',
  },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 52,
    color: '#ecfdf5',
    fontSize: 16,
  },
  passwordInput: { paddingRight: 40 },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  button: {
    borderRadius: 14,
    height: 52,
    marginTop: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: { color: '#a7f3d0', fontSize: 15 },
  loginHighlight: { color: '#34d399', fontWeight: '600' },
});
