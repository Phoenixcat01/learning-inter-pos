import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MoreIcon } from '../components/Icons';

export const LainnyaScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.centerBox}>
        <View style={styles.iconCircle}>
          <MoreIcon size={36} color="#64748b" />
        </View>
        <Text style={styles.title}>Menu Lainnya</Text>
        <Text style={styles.subtitle}>
          Menu ini disediakan sebagai placeholder modul tambahan untuk pengembangan sistem POS di masa mendatang.
        </Text>

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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  grid: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#d97706',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16,
    gap: 6,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
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
    fontWeight: '600',
    color: '#0f172a',
  },
});
