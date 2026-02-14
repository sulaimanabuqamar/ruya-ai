import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Switch as NativeSwitch } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Avatar,
  List,
  SegmentedButtons,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const BACKGROUND = '#242423';
const SURFACE = '#2F312F';
const PRIMARY = '#2563EB';
const TEXT = '#F4F7F5';
const SUBTEXT = '#9CA3AF';

const HISTORY_ITEMS = [
  { id: '1', title: 'Dubai Marina → DIFC', subtitle: 'Ride · Completed' },
  { id: '2', title: 'Offered parking · Business Bay', subtitle: '3 bookings' },
  { id: '3', title: 'JBR → Internet City', subtitle: 'Ride · Completed' },
];

export function ProfileScreen() {
  const { user, loading, login, signup, logout } = useAuth();
  const [authSegment, setAuthSegment] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [femaleOnly, setFemaleOnly] = useState(false);

  const handleLogin = async () => {
    setAuthError('');
    if (!email.trim() || !password) {
      setAuthError('Please enter email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Login failed.');
    }
  };

  const handleSignup = async () => {
    setAuthError('');
    if (!name.trim() || !email.trim() || !password) {
      setAuthError('Please fill in name, email and password.');
      return;
    }
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Sign up failed.');
    }
  };

  const handleAuthSubmit = () => {
    if (authSegment === 'login') {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Please wait…
        </Text>
      </View>
    );
  }

  if (user === null) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign up or log in to manage your carpools.
        </Text>

        <SegmentedButtons
          buttons={[
            { value: 'login', label: 'Log in' },
            { value: 'signup', label: 'Sign up' },
          ]}
          value={authSegment}
          onValueChange={(v) => {
            setAuthSegment(v as 'login' | 'signup');
            setAuthError('');
          }}
          style={styles.segmented}
        />

        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            {authSegment === 'signup' && (
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />
            )}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
            {authError ? (
              <HelperText type="error" visible={!!authError}>
                {authError}
              </HelperText>
            ) : null}
            <Button
              mode="contained"
              onPress={handleAuthSubmit}
              style={styles.continueBtn}
            >
              Continue
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Profile
      </Text>

      <Card style={styles.profileCard} mode="elevated">
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={72}
            label={user.name.slice(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <Text variant="titleLarge" style={styles.userName}>
            {user.name}
          </Text>
          <Text variant="bodySmall" style={styles.rating}>
            {user.email}
          </Text>
          <Text variant="bodySmall" style={styles.rating}>
            4.8 ★
          </Text>
          <View style={styles.tags}>
            <Text variant="labelSmall" style={styles.tag}>
              Safe driver
            </Text>
            <Text variant="labelSmall" style={styles.tag}>
              Reliable passenger
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelBlock}>
              <Text variant="bodyLarge" style={styles.toggleLabel}>
                Female-only carpool
              </Text>
              <Text variant="bodySmall" style={styles.helperText}>
                When enabled, your matches will only include female riders/drivers
                where possible.
              </Text>
            </View>
            <NativeSwitch
              value={Boolean(femaleOnly)}
              onValueChange={setFemaleOnly}
              thumbColor="#F4F7F5"
              ios_backgroundColor="#4B5563"
            />
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        History
      </Text>
      {HISTORY_ITEMS.map((item) => (
        <Card key={item.id} style={styles.historyCard} mode="elevated">
          <List.Item
            title={item.title}
            description={item.subtitle}
            titleStyle={styles.historyTitle}
            descriptionStyle={styles.historySubtitle}
          />
        </Card>
      ))}

      <Button mode="outlined" onPress={() => logout()} style={styles.logoutBtn}>
        Log out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: SUBTEXT,
    marginTop: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    color: TEXT,
    marginBottom: 4,
  },
  subtitle: {
    color: SUBTEXT,
    marginBottom: 20,
  },
  segmented: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: BACKGROUND,
    marginBottom: 12,
  },
  continueBtn: {
    marginTop: 8,
    borderRadius: 16,
  },
  profileCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    marginBottom: 20,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: PRIMARY,
    marginBottom: 12,
  },
  userName: {
    color: TEXT,
    marginBottom: 4,
  },
  rating: {
    color: SUBTEXT,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    color: SUBTEXT,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabelBlock: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: TEXT,
  },
  helperText: {
    color: SUBTEXT,
    marginTop: 4,
  },
  sectionTitle: {
    color: TEXT,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    marginBottom: 8,
  },
  historyTitle: {
    color: TEXT,
  },
  historySubtitle: {
    color: SUBTEXT,
  },
  logoutBtn: {
    marginTop: 24,
    borderRadius: 16,
  },
});
