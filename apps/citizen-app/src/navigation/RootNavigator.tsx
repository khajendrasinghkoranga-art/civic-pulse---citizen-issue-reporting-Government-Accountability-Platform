import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/services/authContext';
import { COLORS } from '@/constants/theme';
import ChatbotFloatingButton from '@/components/ChatbotModal';

import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import MyIssuesScreen from '@/screens/my-issues/MyIssuesScreen';
import IssueDetailScreen from '@/screens/my-issues/IssueDetailScreen';
import ReportIssueScreen from '@/screens/report-issue/ReportIssueScreen';
import CommunityScreen from '@/screens/community/CommunityScreen';
import PollsScreen from '@/screens/polls/PollsScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyIssues: undefined;
  Report: undefined;
  Community: undefined;
  Polls: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  IssueDetail: { issueId: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<keyof MainTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            Home: ['home', 'home-outline'],
            MyIssues: ['document-text', 'document-text-outline'],
            Report: ['add-circle', 'add-circle-outline'],
            Community: ['people', 'people-outline'],
            Polls: ['checkbox', 'checkbox-outline'],
            Profile: ['person', 'person-outline'],
          };
          const [activeIcon, inactiveIcon] = icons[route.name];
          return <Ionicons name={focused ? activeIcon : inactiveIcon} size={route.name === 'Report' ? size + 4 : size} color={route.name === 'Report' && focused ? COLORS.accent : color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="MyIssues" component={MyIssuesScreen} options={{ title: 'Issues' }} />
      <Tab.Screen name="Report" component={ReportIssueScreen} options={{ title: 'Report' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
      <Tab.Screen name="Polls" component={PollsScreen} options={{ title: 'Polls' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {isAuthenticated ? (
          <AppStack.Navigator screenOptions={{ headerShown: false }}>
            <AppStack.Screen name="MainTabs" component={MainTabNavigator} />
            <AppStack.Screen name="IssueDetail" component={IssueDetailScreen} />
          </AppStack.Navigator>
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
      {isAuthenticated && <ChatbotFloatingButton />}
    </View>
  );
}
