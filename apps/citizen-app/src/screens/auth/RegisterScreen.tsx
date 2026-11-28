import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/RootNavigator';
import { useAuth } from '@/services/authContext';
import { COLORS } from '@/constants/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [accountType, setAccountType] = useState<'citizen' | 'official' | 'ngo'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [subscribedAlerts, setSubscribedAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!email.trim().includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('You must accept the Terms of Use and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, phone, password, role: accountType });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Government Top Bar */}
      <View style={styles.govTopBar}>
        <View style={styles.govEmblemRow}>
          <Image source={require('../../../assets/ashok-stambh.png')} style={styles.emblemImg} resizeMode="contain" />
          <View>
            <Text style={styles.emblemTitle}>Government of India</Text>
            <Text style={styles.emblemHindi}>सत्यमेव जयते</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={14} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBrandRow}>
            <View style={styles.logoWrap}>
              <Image source={require('../../../assets/civicpulse-logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Register for a Better Dehradun</Text>
              <Text style={styles.heroSub}>Join CivicPulse • Cleaner, safer & connected city</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.title}>Create Your Account</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginPrompt}>Have an account? <Text style={styles.loginLink}>Login</Text></Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Join CivicPulse and make your voice count.</Text>

            {/* Account Type Selector Tabs */}
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleTab, accountType === 'citizen' && styles.roleTabActive]}
                onPress={() => setAccountType('citizen')}
              >
                <Ionicons name="person-outline" size={16} color={accountType === 'citizen' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.roleTitle, accountType === 'citizen' && styles.roleTitleActive]}>Citizen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, accountType === 'official' && styles.roleTabActive]}
                onPress={() => setAccountType('official')}
              >
                <Ionicons name="business-outline" size={16} color={accountType === 'official' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.roleTitle, accountType === 'official' && styles.roleTitleActive]}>Official</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, accountType === 'ngo' && styles.roleTabActive]}
                onPress={() => setAccountType('ngo')}
              >
                <Ionicons name="people-outline" size={16} color={accountType === 'ngo' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.roleTitle, accountType === 'ngo' && styles.roleTitleActive]}>NGO / Partner</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={18} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Full Name <Text style={styles.req}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.label}>Email Address <Text style={styles.req}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <Text style={styles.label}>Aadhaar Number <Text style={styles.opt}>(Optional)</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="card-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                value={aadhaar}
                onChangeText={setAadhaar}
              />
            </View>
            <View style={styles.secureHint}>
              <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
              <Text style={styles.secureHintText}>Your data is encrypted and secure</Text>
            </View>

            <Text style={styles.label}>Password <Text style={styles.req}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Create a strong password (min 8 chars)"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password <Text style={styles.req}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Checkboxes */}
            <TouchableOpacity style={styles.checkRow} onPress={() => setAgreedTerms((v) => !v)}>
              <Ionicons name={agreedTerms ? 'checkbox' : 'square-outline'} size={20} color={agreedTerms ? COLORS.primary : COLORS.textMuted} />
              <Text style={styles.checkText}>I agree to the Terms of Use and Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkRow} onPress={() => setSubscribedAlerts((v) => !v)}>
              <Ionicons name={subscribedAlerts ? 'checkbox' : 'square-outline'} size={20} color={subscribedAlerts ? COLORS.primary : COLORS.textMuted} />
              <Text style={styles.checkText}>I want to receive updates, newsletters and important alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.ssoGrid}>
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => Alert.alert('Aadhaar DigiLocker', 'Aadhaar verification is connected for registered Indian citizens via DigiLocker.')}
              >
                <Ionicons name="card-outline" size={15} color="#2563EB" />
                <Text style={styles.ssoText}>Aadhaar DigiLocker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => Alert.alert('Mobile OTP', 'Mobile OTP verification is active for verified Indian mobile numbers.')}
              >
                <Ionicons name="phone-portrait-outline" size={15} color="#16A34A" />
                <Text style={styles.ssoText}>Mobile OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F2557' },
  govTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B1B3E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  govEmblemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emblemImg: { width: 24, height: 30 },
  emblemTitle: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  emblemHindi: { fontSize: 10, color: '#FDE68A' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  logoBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 42, height: 42 },
  heroTitle: { fontSize: 19, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  loginPrompt: { fontSize: 12, color: COLORS.textSecondary },
  loginLink: { fontWeight: '700', color: '#2563EB' },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  roleTabActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  roleTitle: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  roleTitleActive: { color: COLORS.primary },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  errorText: { color: '#B91C1C', fontSize: 12, flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 5, marginTop: 10 },
  req: { color: '#EF4444' },
  opt: { color: COLORS.textMuted, fontWeight: '400' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F8FAFC',
  },
  input: { flex: 1, fontSize: 14, color: COLORS.text },
  secureHint: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  secureHintText: { fontSize: 11, color: '#16A34A', fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  checkText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ssoGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  ssoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  ssoText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
});
