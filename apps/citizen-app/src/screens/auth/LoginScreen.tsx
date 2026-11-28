import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { COLORS, API_BASE_URL } from '@/constants/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: 'Khajendra Singh Koranga',
    email: 'khajendrasinghkoranga@gmail.com',
    color: '#2563EB',
  },
  {
    name: 'Ananya Sharma',
    email: 'ananya.sharma.civic@gmail.com',
    color: '#059669',
  },
  {
    name: 'Rohan Mehra',
    email: 'rohan.mehra.dehradun@gmail.com',
    color: '#D97706',
  },
];

export default function LoginScreen({ navigation }: Props) {
  const { login, loginWithGoogle } = useAuth();
  const [role, setRole] = useState<'citizen' | 'official' | 'ngo'>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your registered email address and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.log('Login error details:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`[${API_BASE_URL}] ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (targetEmail: string, targetName?: string) => {
    setGoogleError('');
    if (!targetEmail.trim() || !targetEmail.includes('@')) {
      setGoogleError('Please enter a valid Google email address.');
      return;
    }
    setGoogleLoading(true);
    try {
      await loginWithGoogle({
        email: targetEmail.trim().toLowerCase(),
        name: targetName?.trim() || targetEmail.split('@')[0],
      });
      setGoogleModalOpen(false);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Government Portal Bar matching website */}
      <View style={styles.govTopBar}>
        <View style={styles.govEmblemRow}>
          <Image source={require('../../../assets/ashok-stambh.png')} style={styles.emblemImg} resizeMode="contain" />
          <View>
            <Text style={styles.emblemTitle}>Government of India</Text>
            <Text style={styles.emblemHindi}>सत्यमेव जयते</Text>
          </View>
        </View>
        <View style={styles.digitalIndiaBadge}>
          <Text style={styles.digitalIndiaTitle}>Digital India</Text>
          <Text style={styles.digitalIndiaSub}>People • Process • Progress</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero Branding Section */}
          <View style={styles.heroSection}>
            <View style={styles.quoteBubble}>
              <Text style={styles.quoteText}>“Jan Bhagidari se Hi Viksit Bharat”</Text>
              <View style={styles.tricolorBar}>
                <View style={[styles.tricolorSeg, { backgroundColor: '#FF9933' }]} />
                <View style={[styles.tricolorSeg, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.tricolorSeg, { backgroundColor: '#138808' }]} />
              </View>
            </View>

            <View style={styles.logoBrandRow}>
              <View style={styles.logoWrap}>
                <Image source={require('../../../assets/civicpulse-logo.png')} style={styles.logoImg} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brand}>Sign in to CivicPulse</Text>
                <Text style={styles.tagline}>Dehradun, Uttarakhand • Clean City | Green City | Smart City</Text>
              </View>
            </View>
          </View>

          {/* Main Form Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.title}>Sign In to Your Account</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.headerLink}>New user? <Text style={styles.headerLinkBold}>Register</Text></Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Enter your credentials to access your citizen workspace.</Text>

            {/* Role Selector Tabs */}
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleTab, role === 'citizen' && styles.roleTabActive]}
                onPress={() => setRole('citizen')}
              >
                <Ionicons name="person-outline" size={16} color={role === 'citizen' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.roleTitle, role === 'citizen' && styles.roleTitleActive]}>Citizen</Text>
                <Text style={styles.roleSub}>(Public)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, role === 'official' && styles.roleTabActive]}
                onPress={() => Alert.alert('Admin Portal', 'Government Officials & Magistrates use the Admin Web Portal (port 3001).')}
              >
                <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.roleTitle}>Official</Text>
                <Text style={styles.roleSub}>(Admin ↗)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, role === 'ngo' && styles.roleTabActive]}
                onPress={() => setRole('ngo')}
              >
                <Ionicons name="people-outline" size={16} color={role === 'ngo' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.roleTitle, role === 'ngo' && styles.roleTitleActive]}>NGO</Text>
                <Text style={styles.roleSub}>(Partner)</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={18} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email Address <Text style={styles.req}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Enter your registered email address"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Password <Text style={styles.req}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Enter your account password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Quick Demo Credentials Help matching website */}
            <View style={styles.demoBox}>
              <View style={styles.demoHeader}>
                <Ionicons name="key-outline" size={14} color="#F59E0B" />
                <Text style={styles.demoTitle}>Default Logins (Tap to autofill):</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setEmail('khajendrasinghkoranga@gmail.com');
                  setPassword('CivicPulse@123');
                  setError('');
                }}
              >
                <Text style={styles.demoLine}>• <Text style={styles.demoBold}>Google Account:</Text> khajendrasinghkoranga@gmail.com / CivicPulse@123</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEmail('ananya@example.com');
                  setPassword('CivicPulse@123');
                  setError('');
                }}
              >
                <Text style={styles.demoLine}>• <Text style={styles.demoBold}>Citizen Demo:</Text> ananya@example.com / CivicPulse@123</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => {
                setGoogleError('');
                setGoogleModalOpen(true);
              }}
            >
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.ssoGrid}>
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => Alert.alert('Aadhaar DigiLocker', 'Aadhaar OTP is connected for registered Indian citizens via DigiLocker.')}
              >
                <Ionicons name="shield-checkmark-outline" size={15} color="#2563EB" />
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

            <View style={styles.securityBox}>
              <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.secTitle}>Your information is safe with us.</Text>
                <Text style={styles.secDesc}>
                  We follow government data security standards and never share your personal details without consent.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Auth Modal matching web GoogleAuthModal */}
      <Modal visible={googleModalOpen} transparent animationType="slide" onRequestClose={() => setGoogleModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.modalTitle}>Google Sign-In</Text>
              </View>
              <TouchableOpacity onPress={() => setGoogleModalOpen(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Choose a Google account or enter your Gmail address to sign in.</Text>

            {googleError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{googleError}</Text>
              </View>
            ) : null}

            {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                style={styles.presetRow}
                disabled={googleLoading}
                onPress={() => handleGoogleSignIn(acc.email, acc.name)}
              >
                <View style={[styles.presetAvatar, { backgroundColor: acc.color }]}>
                  <Text style={styles.presetAvatarText}>{acc.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.presetName}>{acc.name}</Text>
                  <Text style={styles.presetEmail}>{acc.email}</Text>
                </View>
                <Ionicons name="arrow-forward-circle-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))}

            <View style={[styles.dividerRow, { marginVertical: 12 }]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR USE ANOTHER GOOGLE EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="name@gmail.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={googleEmail}
                onChangeText={setGoogleEmail}
              />
            </View>

            <View style={[styles.inputWrap, { marginTop: 8 }]}>
              <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Full Name (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={googleName}
                onChangeText={setGoogleName}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, googleLoading && styles.disabledBtn]}
              onPress={() => handleGoogleSignIn(googleEmail, googleName)}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  digitalIndiaBadge: { alignItems: 'flex-end' },
  digitalIndiaTitle: { fontSize: 11, fontWeight: '700', color: '#FB923C' },
  digitalIndiaSub: { fontSize: 9, color: '#CBD5E1' },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 28 },
  heroSection: { marginBottom: 14 },
  quoteBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  quoteText: { fontSize: 11, fontWeight: '700', color: '#FDE68A' },
  tricolorBar: { flexDirection: 'row', height: 3, marginTop: 4, borderRadius: 2, overflow: 'hidden' },
  tricolorSeg: { flex: 1 },
  logoBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: { width: 46, height: 46 },
  brand: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  tagline: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  headerLink: { fontSize: 12, color: COLORS.textSecondary },
  headerLinkBold: { fontWeight: '700', color: '#2563EB' },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  roleTabActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  roleTitle: { fontSize: 11, fontWeight: '700', color: COLORS.text, marginTop: 3 },
  roleTitleActive: { color: COLORS.primary },
  roleSub: { fontSize: 9, color: COLORS.textMuted },
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
  label: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 5, marginTop: 8 },
  req: { color: '#EF4444' },
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
  primaryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.7 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  demoBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    gap: 4,
  },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  demoTitle: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  demoLine: { fontSize: 11, color: COLORS.textSecondary, paddingVertical: 2 },
  demoBold: { fontWeight: '700', color: COLORS.text },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 10, fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  googleBtnText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  ssoGrid: { flexDirection: 'row', gap: 8, marginTop: 10 },
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
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 14,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  secDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, lineHeight: 15 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, marginBottom: 12 },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  presetAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  presetName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  presetEmail: { fontSize: 11, color: COLORS.textSecondary },
});
