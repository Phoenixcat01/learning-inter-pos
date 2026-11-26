import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MoreIcon, LogoutIcon, UserIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

export const LainnyaScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.centerBox}>
        <View style={styles.iconCircle}>
          <MoreIcon size={36} color="#64748b" />
        </View>
        <Text style={styles.title}>Menu Lainnya</Text>
        <Text style={styles.subtitle}>
          Pengaturan akun kasir dan modul sistem POS tambahan.
        </Text>

        {/* User Profile Card */}
        {user && (
          <View style={styles.userSection}>
            <View style={styles.userCardHeader}>
              <View style={styles.userIconWrapper}>
                <UserIcon size={32} color="#059669" />
              </View>
              <View style={styles.userDetail}>
                <Text style={styles.userName}>{user.nama}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={signOut}
              style={styles.logoutButton}
            >
              <LogoutIcon size={18} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feature Cards */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>SEGERA HADIR</Text>
            </View>
            <Text style={styles.cardTitle}>Pengaturan Toko</Text>
            <Text style={styles.cardDesc}>
              Atur nama toko, alamat, logo struk, dan persentase pajak PPN.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>SEGERA HADIR</Text>
            </View>
            <Text style={styles.cardTitle}>Laporan & Analitik</Text>
            <Text style={styles.cardDesc}>
              Grafik penjualan harian/bulanan dan ekspor data pembukuan.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>SEGERA HADIR</Text>
            </View>
            <Text style={styles.cardTitle}>Printer Kasir Thermal</Text>
            <Text style={styles.cardDesc}>
              Integrasi printer thermal 58mm / 80mm via Bluetooth atau USB.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>SEGERA HADIR</Text>
            </View>
            <Text style={styles.cardTitle}>Manajemen Staf</Text>
            <Text style={styles.cardDesc}>
              Hak akses kasir, shift kerja, dan rekonsiliasi uang kas harian.
            </Text>
          </View>
        </View>

        {/* Tech Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Informasi Teknis Aplikasi</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Framework:</Text>
            <Text style={styles.infoVal}>Expo SDK 58</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Arsitektur:</Text>
            <Text style={styles.infoVal}>Universal React Native (Web + Mobile)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Target:</Text>
            <Text style={styles.infoVal}>Expo Go (Android/iOS) & Web Static</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  centerBox: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  userSection: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 14,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetail: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 6,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoKey: {
    fontSize: 11,
    color: '#64748b',
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0f172a',
  },
});
