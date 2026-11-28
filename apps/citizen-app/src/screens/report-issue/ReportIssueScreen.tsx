import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '@/navigation/RootNavigator';
import { apiClient } from '@/services/apiClient';
import { DEHRADUN_SECTORS, resolveSectorClient, type SectorDefinition } from '@/constants/sectors';
import { COLORS } from '@/constants/theme';
import type { ApiResponse, Issue, IssueCategory, IssuePriority } from '@/types';

interface GeotaggedPhoto {
  uri: string;
  base64: string;
  mimeType: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number | null;
}

const FALLBACK_CATEGORIES: IssueCategory[] = [
  { id: 'cat-road', name: 'Roads & Infrastructure', icon: '🛣️', defaultPriority: 'MEDIUM', defaultSlaHours: 48 },
  { id: 'cat-light', name: 'Street Lighting', icon: '💡', defaultPriority: 'MEDIUM', defaultSlaHours: 24 },
  { id: 'cat-water', name: 'Water & Sanitation', icon: '🚰', defaultPriority: 'HIGH', defaultSlaHours: 12 },
  { id: 'cat-waste', name: 'Waste Management', icon: '🗑️', defaultPriority: 'LOW', defaultSlaHours: 48 },
  { id: 'cat-drain', name: 'Drainage & Sewerage', icon: '🌊', defaultPriority: 'HIGH', defaultSlaHours: 24 },
];

const SUBCATEGORIES = [
  { value: '', label: 'Select sub-category' },
  { value: 'pothole', label: 'Deep Pothole / Road Cave-in' },
  { value: 'broken', label: 'Broken Asphalt' },
  { value: 'manhole', label: 'Uncovered Manhole' },
];

const DEHRADUN_LANDMARKS = [
  { name: 'Ghanta Ghar, Rajpur Road, Dehradun', lat: 30.3244, lng: 78.0417 },
  { name: 'ISBT Dehradun, Saharanpur Road', lat: 30.2896, lng: 77.9977 },
  { name: 'Jakhan / Rajpur, Dehradun', lat: 30.3652, lng: 78.0668 },
  { name: 'Prem Nagar, Chakrata Road, Dehradun', lat: 30.3338, lng: 77.9612 },
  { name: 'Raipur / Sahastradhara Road, Dehradun', lat: 30.3125, lng: 78.0824 },
  { name: 'Clement Town, Dehradun', lat: 30.2681, lng: 78.0067 },
];

const COMMON_ISSUES = [
  { icon: '🛣️', label: 'Pothole / Road Damage', title: 'Pothole on Rajpur Road' },
  { icon: '🗑️', label: 'Garbage / Waste', title: 'Garbage heap not cleared' },
  { icon: '💡', label: 'Street Light Not Working', title: 'Street Light Not Working' },
  { icon: '🚰', label: 'Water Supply Issues', title: 'Water pipeline leak' },
  { icon: '🌊', label: 'Drainage / Sewer', title: 'Drain overflowing on road' },
  { icon: '🚧', label: 'Encroachment', title: 'Illegal encroachment on footpath' },
  { icon: '🐾', label: 'Stray Animals', title: 'Stray cattle issue' },
  { icon: '🌳', label: 'Park / Public Space', title: 'Park bench and equipment broken' },
  { icon: '📢', label: 'Noise Pollution', title: 'Excessive loudspeaker noise' },
];

export default function ReportIssueScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const [categories, setCategories] = useState<IssueCategory[]>(FALLBACK_CATEGORIES);
  const [categoryId, setCategoryId] = useState(FALLBACK_CATEGORIES[0].id);
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssuePriority>('LOW');
  const [relatedDepartment, setRelatedDepartment] = useState('Public Works Department (PWD)');

  // Location fields matching website
  const [searchAddress, setSearchAddress] = useState('Ghanta Ghar, Rajpur Road, Dehradun');
  const [latitude, setLatitude] = useState(30.3244);
  const [longitude, setLongitude] = useState(78.0417);
  const [locating, setLocating] = useState(false);

  // Municipal Sector Load Balancing & Routing
  const [currentSector, setCurrentSector] = useState<SectorDefinition>(DEHRADUN_SECTORS[0]);
  const [isManualSector, setIsManualSector] = useState(false);
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [subcatModalOpen, setSubcatModalOpen] = useState(false);

  // Evidence / Media files - Live Geotagged Camera
  const [photos, setPhotos] = useState<GeotaggedPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Live real-time clock matching website
  const [liveTimeStr, setLiveTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTimeStr(
        now.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isManualSector) {
      setCurrentSector(resolveSectorClient(latitude, longitude, searchAddress));
    }
  }, [latitude, longitude, searchAddress, isManualSector]);

  const updateDepartmentForCategory = (catName?: string) => {
    if (!catName) {
      setRelatedDepartment('Auto-assigned based on category');
      return;
    }
    if (catName.includes('Road')) setRelatedDepartment('Public Works Department (PWD)');
    else if (catName.includes('Light')) setRelatedDepartment('Electricity & Street Lighting Dept');
    else if (catName.includes('Water')) setRelatedDepartment('Jal Sansthan (Water Supply)');
    else if (catName.includes('Waste')) setRelatedDepartment('Nagar Nigam Sanitation Dept');
    else setRelatedDepartment('Municipal Corporation of Dehradun');
  };

  useEffect(() => {
    apiClient
      .get<ApiResponse<IssueCategory[]>>('/issues/categories')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setCategoryId(res.data[0].id);
          updateDepartmentForCategory(res.data[0].name);
        }
      })
      .catch(() => {
        // Keep fallback categories matching website
      });
  }, []);

  const handleSelectCategory = (cat: IssueCategory) => {
    setCategoryId(cat.id);
    updateDepartmentForCategory(cat.name);
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission helps route your issue to the right Dehradun sector.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lng = parseFloat(pos.coords.longitude.toFixed(4));
      setLatitude(lat);
      setLongitude(lng);

      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (places.length > 0) {
        const p = places[0];
        const formatted = [p.name, p.street, p.district || p.city, p.region].filter(Boolean).join(', ');
        if (formatted) setSearchAddress(formatted);
      } else {
        setSearchAddress('Dehradun Center, Rajpur Road, Dehradun');
      }
    } catch {
      setLatitude(30.3165);
      setLongitude(78.0322);
      Alert.alert('Location', 'Could not read GPS location. Using Dehradun center coordinates.');
    } finally {
      setLocating(false);
    }
  };

  const handleOpenGeotaggedCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Permission', 'Camera access is required to capture live geotagged evidence.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        const asset = result.assets[0];
        let capLat = latitude;
        let capLng = longitude;
        let capAcc: number | null = null;

        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            capLat = pos.coords.latitude;
            capLng = pos.coords.longitude;
            capAcc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
          }
        } catch {
          // keep current selected coordinates
        }

        setPhotos((prev) => [
          ...prev,
          {
            uri: asset.uri,
            base64: asset.base64!,
            mimeType: asset.mimeType || 'image/jpeg',
            latitude: capLat,
            longitude: capLng,
            timestamp: new Date().toISOString(),
            accuracy: capAcc,
          },
        ]);
      }
    } catch {
      Alert.alert('Camera Error', 'Could not open camera on this device.');
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!title.trim() || title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }
    if (!categoryId) {
      setError('Please select a valid civic category.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post<ApiResponse<Issue>>('/issues', {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority: severity,
        latitude: parseFloat(latitude.toFixed(4)),
        longitude: parseFloat(longitude.toFixed(4)),
        address: searchAddress.trim() || 'Dehradun, Uttarakhand',
        sector: currentSector.name,
        locality: currentSector.zone,
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: '248001',
      });

      const createdIssueId = res.data?.id;
      if (createdIssueId && photos.length > 0) {
        for (const p of photos) {
          try {
            await apiClient.post(`/uploads/issues/${createdIssueId}/evidence`, {
              contentBase64: `data:${p.mimeType};base64,${p.base64}`,
              contentType: p.mimeType || 'image/jpeg',
            });
          } catch {
            // continue even if one upload warns
          }
        }
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setPhotos([]);
      setTimeout(() => {
        setSuccess(false);
        tabNav.navigate('MyIssues');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report civic issue to database.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = photos.length > 0 ? 3 : searchAddress.trim() ? 2 : 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Official Government Header Bar matching website */}
      <View style={styles.govBar}>
        <View style={styles.govLeft}>
          <Image source={require('../../../assets/ashok-stambh.png')} style={styles.emblemImg} resizeMode="contain" />
          <Image source={require('../../../assets/civicpulse-logo.png')} style={styles.logoImg} resizeMode="contain" />
          <View>
            <Text style={styles.govTitle}>CivicPulse • Government of India</Text>
            <Text style={styles.govSub}>Dehradun District, Uttarakhand</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Page Title Card with Stepper matching website */}
        <View style={styles.headerCard}>
          <Text style={styles.pageTitle}>📄 Report a Civic Issue</Text>
          <Text style={styles.pageDesc}>
            Help us build a cleaner, safer and better Dehradun. Your report will be routed to the concerned department.
          </Text>

          <View style={styles.timestampPill}>
            <Text style={styles.timestampLabel}>🕒 Filing Date & Time: </Text>
            <Text style={styles.timestampVal}>{liveTimeStr ? `${liveTimeStr} (Official Real-Time Record)` : 'Live Timestamp'}</Text>
          </View>

          {/* 3-Step Stepper */}
          <View style={styles.stepperRow}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNum, currentStep >= 1 && styles.stepNumActive]}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Issue Details</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNum, currentStep >= 2 && styles.stepNumActive]}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Location & Evidence</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNum, currentStep >= 3 && styles.stepNumActive]}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Review & Submit</Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.alertSuccess}>
            <Text style={styles.alertSuccessText}>✅ Issue reported successfully! Redirecting to My Issues...</Text>
          </View>
        ) : null}

        {/* Box 1: 1. Issue Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.secTitle}>1. Issue Details</Text>
          <Text style={styles.secSub}>Provide accurate information to help us resolve the issue faster.</Text>

          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Issue Title <Text style={styles.req}>*</Text></Text>
            <Text style={styles.charCount}>{title.length}/150</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="E.g. Pothole near Rajpur Road"
            placeholderTextColor={COLORS.textMuted}
            maxLength={150}
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Description <Text style={styles.req}>*</Text></Text>
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Category <Text style={styles.req}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, categoryId === cat.id && styles.chipActive]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Sub-category</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setSubcatModalOpen(true)}>
            <Text style={styles.selectText}>
              {SUBCATEGORIES.find((s) => s.value === subCategory)?.label || 'Select sub-category'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Severity <Text style={styles.req}>*</Text></Text>
          <View style={styles.sevGrid}>
            {[
              { key: 'LOW' as const, name: 'Low', desc: 'Minor issue', dot: '#22C55E', bg: '#F0FDF4', border: '#86EFAC' },
              { key: 'MEDIUM' as const, name: 'Medium', desc: 'Needs attention', dot: '#EAB308', bg: '#FEFCE8', border: '#FDE047' },
              { key: 'HIGH' as const, name: 'High', desc: 'Affects many people', dot: '#F97316', bg: '#FFF7ED', border: '#FDBA74' },
              { key: 'URGENT' as const, name: 'Critical', desc: 'Urgent action required', dot: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5' },
            ].map((item) => {
              const selected = severity === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sevBtn,
                    selected && { backgroundColor: item.bg, borderColor: item.border, borderWidth: 1.5 },
                  ]}
                  onPress={() => setSeverity(item.key)}
                >
                  <View style={[styles.sevDot, { backgroundColor: item.dot }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sevName}>{item.name}</Text>
                    <Text style={styles.sevDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Related Department</Text>
          <View style={styles.deptBox}>
            <Text style={styles.deptText}>🏢 {relatedDepartment}</Text>
          </View>

          <View style={styles.infoCallout}>
            <Text style={styles.infoCalloutText}>
              ℹ️ Please provide genuine information. False or misleading reports may lead to action against your account.
            </Text>
          </View>
        </View>

        {/* Box 2: 2. Location & Municipal Sector Routing */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeaderRow}>
            <Text style={styles.secTitle}>2. Location</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>● Live GPS Active</Text>
            </View>
          </View>
          <Text style={styles.secSub}>Pinpoint the exact location in Dehradun or tap GPS My Location.</Text>

          <View style={styles.locToggleRow}>
            <TouchableOpacity
              style={[styles.locBtn, styles.locBtnActive]}
              onPress={handleUseMyLocation}
              disabled={locating}
            >
              {locating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.locBtnActiveText}>📍 GPS My Location</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locBtn}
              onPress={() => {
                setIsManualSector(false);
                setLatitude(30.3244);
                setLongitude(78.0417);
                setSearchAddress('Ghanta Ghar, Rajpur Road, Dehradun');
              }}
            >
              <Text style={styles.locBtnText}>🗺️ Reset Clock Tower</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Text style={{ fontSize: 14 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Selected address / landmark in Dehradun"
              placeholderTextColor={COLORS.textMuted}
              value={searchAddress}
              onChangeText={setSearchAddress}
            />
            {searchAddress ? (
              <TouchableOpacity onPress={() => setSearchAddress('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Quick Dehradun Landmarks */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.landmarkRow}>
            {DEHRADUN_LANDMARKS.map((lm) => (
              <TouchableOpacity
                key={lm.name}
                style={styles.landmarkChip}
                onPress={() => {
                  setLatitude(lm.lat);
                  setLongitude(lm.lng);
                  setSearchAddress(lm.name);
                }}
              >
                <Text style={styles.landmarkText}>📍 {lm.name.split(',')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.coordRow}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValue}>{latitude}</Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValue}>{longitude}</Text>
            </View>
          </View>

          {/* Municipal Sector Routing & Load Balancing Box */}
          <View style={styles.sectorRoutingBox}>
            <View style={styles.secHeaderRow}>
              <Text style={styles.sectorRoutingTitle}>🏛️ Municipal Sector Routing & Load Balancing</Text>
            </View>
            <View style={styles.smartBadge}>
              <Text style={styles.smartBadgeText}>⚡ Smart Load Shared</Text>
            </View>
            <Text style={styles.sectorRoutingSub}>
              To prevent central bottleneck, this complaint is auto-assigned to the regional sector unit based on your coordinates:
            </Text>

            <View style={styles.sectorCard}>
              <View style={styles.secHeaderRow}>
                <Text style={styles.sectorName}>📍 {currentSector.name}</Text>
                <View style={styles.normalLoadBadge}>
                  <Text style={styles.normalLoadText}>🟢 Normal Load</Text>
                </View>
              </View>
              <Text style={styles.sectorMeta}>Zone: <Text style={{ fontWeight: '700', color: COLORS.text }}>{currentSector.zone}</Text></Text>
              <Text style={styles.sectorMeta}>🏢 Dispatch Unit: <Text style={{ fontWeight: '700', color: '#0284C7' }}>{currentSector.dispatchUnit}</Text></Text>
              <Text style={styles.sectorMeta}>📞 Sector Helpline: <Text style={{ fontWeight: '600' }}>{currentSector.helpline}</Text></Text>
            </View>

            <View style={styles.manualSectorRow}>
              <Text style={styles.manualSectorLabel}>Manual Sector:</Text>
              <TouchableOpacity style={styles.manualSectorSelect} onPress={() => setSectorModalOpen(true)}>
                <Text style={styles.manualSectorText} numberOfLines={1}>{currentSector.name}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
              {isManualSector ? (
                <TouchableOpacity
                  onPress={() => {
                    setIsManualSector(false);
                    setCurrentSector(resolveSectorClient(latitude, longitude, searchAddress));
                  }}
                >
                  <Text style={styles.autoDetectLink}>Auto-Detect</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Box 3: 3. Geotagged Evidence (Photo / Video) */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeaderRow}>
            <Text style={styles.secTitle}>3. Geotagged Evidence</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>📍 Auto-Geotagged</Text>
            </View>
          </View>
          <Text style={styles.secSub}>
            Photos are stamped with live GPS coordinates, timestamp & verification watermark — preventing fake or old uploads.
          </Text>

          <TouchableOpacity style={styles.cameraBox} onPress={handleOpenGeotaggedCamera}>
            <Text style={{ fontSize: 32 }}>📍📷</Text>
            <Text style={styles.cameraBoxTitle}>Capture Geotagged Photo</Text>
            <Text style={styles.cameraBoxSub}>📍 GPS coordinates, date & time will be stamped directly on your photo</Text>
            <View style={styles.cameraBoxBtn}>
              <Text style={styles.cameraBoxBtnText}>Open Geotagged Camera</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Captured Evidence ({photos.length}):</Text>
          {photos.length === 0 ? (
            <View style={styles.emptyEvidence}>
              <Text style={styles.emptyEvidenceText}>
                📷 No geotagged evidence captured yet. Tap the button above to capture a live geotagged photo.
              </Text>
            </View>
          ) : (
            <View style={styles.thumbGrid}>
              {photos.map((p, idx) => (
                <View key={idx} style={styles.thumbWrap}>
                  <Image source={{ uri: p.uri }} style={styles.thumbImg} />
                  <View style={styles.geotagTopBadge}>
                    <Text style={styles.geotagTopText}>📍 Geotagged</Text>
                  </View>
                  <TouchableOpacity style={styles.removeThumbBtn} onPress={() => removePhoto(idx)}>
                    <Text style={styles.removeThumbText}>✕</Text>
                  </TouchableOpacity>
                  <View style={styles.geotagBottomOverlay}>
                    <Text style={styles.geotagCoords}>
                      📍 {p.latitude.toFixed(4)}°, {p.longitude.toFixed(4)}°
                    </Text>
                    <Text style={styles.geotagTime}>
                      {new Date(p.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {p.accuracy != null ? ` • ±${p.accuracy}m` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Row matching website */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => tabNav.navigate('Home')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Civic Issue →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Widget 1: Tips for a Better Report */}
        <View style={styles.sectionCard}>
          <Text style={styles.widgetTitle}>💡 Tips for a Better Report</Text>
          {[
            'Provide clear and accurate details',
            'Add photos or videos',
            'Use exact location or landmark',
            'Select the correct category',
            'Mention impact on citizens (if any)',
          ].map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Text style={styles.tipTick}>✓</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Widget 2: Common Issues Quick Menu */}
        <View style={styles.sectionCard}>
          <Text style={styles.widgetTitle}>Common Issues (Tap to Quick-Fill)</Text>
          {COMMON_ISSUES.map((ci) => (
            <TouchableOpacity
              key={ci.label}
              style={styles.commonItem}
              onPress={() => setTitle(ci.title)}
            >
              <Text style={{ fontSize: 16 }}>{ci.icon}</Text>
              <Text style={styles.commonName}>{ci.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Widget 3: Emergency Helpline Box */}
        <View style={styles.emergencyCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.emgTitle}>📞 Emergency?</Text>
            <Text style={styles.emgDesc}>For urgent matters, contact district helpline immediately.</Text>
          </View>
          <TouchableOpacity style={styles.emgBtn} onPress={() => Linking.openURL('tel:112')}>
            <Text style={styles.emgBtnText}>📞 112</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sub-category Modal */}
      <Modal visible={subcatModalOpen} transparent animationType="fade" onRequestClose={() => setSubcatModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Sub-category</Text>
            {SUBCATEGORIES.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={styles.modalOption}
                onPress={() => {
                  setSubCategory(s.value);
                  setSubcatModalOpen(false);
                }}
              >
                <Text style={[styles.modalOptionText, subCategory === s.value && { color: COLORS.primary, fontWeight: '700' }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Manual Sector Modal */}
      <Modal visible={sectorModalOpen} transparent animationType="fade" onRequestClose={() => setSectorModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Dehradun Municipal Sector</Text>
            {DEHRADUN_SECTORS.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                style={styles.modalOption}
                onPress={() => {
                  setIsManualSector(true);
                  setCurrentSector(sec);
                  setSectorModalOpen(false);
                }}
              >
                <Text style={[styles.modalOptionText, currentSector.id === sec.id && { color: COLORS.primary, fontWeight: '700' }]}>
                  {sec.name}
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted }}>{sec.zone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  govBar: {
    backgroundColor: '#0F2557',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  govLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emblemImg: { width: 22, height: 28 },
  logoImg: { width: 28, height: 28, backgroundColor: '#FFFFFF', borderRadius: 6, padding: 2 },
  govTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  govSub: { color: '#CBD5E1', fontSize: 10 },
  scroll: { padding: 14, paddingBottom: 36, gap: 12 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  pageDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 17 },
  timestampPill: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timestampLabel: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  timestampVal: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepNum: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  stepNumActive: { color: '#FFFFFF' },
  stepLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  stepLine: { height: 2, backgroundColor: '#CBD5E1', width: 20, marginBottom: 14 },
  alertError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: 10, padding: 12 },
  alertErrorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600' },
  alertSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, borderRadius: 10, padding: 12 },
  alertSuccessText: { color: '#15803D', fontSize: 13, fontWeight: '700' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  secTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  secSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, marginBottom: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 5 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 5 },
  req: { color: '#EF4444' },
  charCount: { fontSize: 11, color: COLORS.textMuted },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: { height: 96, paddingTop: 10, textAlignVertical: 'top' },
  chipRow: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  selectText: { fontSize: 13, color: COLORS.text },
  sevGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sevBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  sevDot: { width: 10, height: 10, borderRadius: 5 },
  sevName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sevDesc: { fontSize: 10, color: COLORS.textSecondary },
  deptBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deptText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  infoCallout: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoCalloutText: { fontSize: 11, color: '#1E40AF', lineHeight: 16 },
  liveBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveBadgeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  locToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  locBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  locBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  locBtnActiveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  locBtnText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text },
  landmarkRow: { gap: 8, paddingVertical: 8 },
  landmarkChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  landmarkText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  coordRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  coordBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
  },
  coordLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },
  coordValue: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  sectorRoutingBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  sectorRoutingTitle: { fontSize: 13, fontWeight: '800', color: '#1E3A8A' },
  smartBadge: {
    alignSelf: 'flex-start',
    marginTop: 5,
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  smartBadgeText: { fontSize: 10, fontWeight: '700', color: '#0284C7' },
  sectorRoutingSub: { fontSize: 11, color: '#334155', marginTop: 6, marginBottom: 8, lineHeight: 16 },
  sectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 3,
  },
  sectorName: { fontSize: 13, fontWeight: '800', color: COLORS.text, flex: 1 },
  normalLoadBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  normalLoadText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  sectorMeta: { fontSize: 11, color: COLORS.textSecondary },
  manualSectorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  manualSectorLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  manualSectorSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  manualSectorText: { fontSize: 12, fontWeight: '600', color: COLORS.text, flex: 1 },
  autoDetectLink: { fontSize: 11, fontWeight: '700', color: '#2563EB', textDecorationLine: 'underline' },
  cameraBox: {
    backgroundColor: '#1E40AF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  cameraBoxTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginTop: 6 },
  cameraBoxSub: { color: '#BFDBFE', fontSize: 11, textAlign: 'center', marginTop: 4 },
  cameraBoxBtn: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cameraBoxBtnText: { color: '#1D4ED8', fontSize: 13, fontWeight: '800' },
  emptyEvidence: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
  },
  emptyEvidenceText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  thumbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 140, height: 110, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#334155', position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  geotagTopBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(37, 99, 235, 0.88)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  geotagTopText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  removeThumbBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.9)', alignItems: 'center', justifyContent: 'center' },
  removeThumbText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  geotagBottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.85)', padding: 4 },
  geotagCoords: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  geotagTime: { color: '#CBD5E1', fontSize: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  widgetTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  tipTick: { color: '#16A34A', fontWeight: '800', fontSize: 14 },
  tipText: { fontSize: 12, color: COLORS.textSecondary },
  commonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  commonName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  emgTitle: { fontSize: 14, fontWeight: '800', color: '#991B1B' },
  emgDesc: { fontSize: 11, color: '#B91C1C', marginTop: 2 },
  emgBtn: { backgroundColor: '#DC2626', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  emgBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, maxHeight: '80%' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  modalOption: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  modalOptionText: { fontSize: 14, color: COLORS.text },
});
