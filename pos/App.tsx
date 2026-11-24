import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import './tailwind.css';
import { POSProvider, usePOS } from './src/context/POSContext';
import { Sidebar } from './src/components/Sidebar';
import { Header } from './src/components/Header';
import { KasirScreen } from './src/screens/KasirScreen';
import { KeranjangScreen } from './src/screens/KeranjangScreen';
import { RiwayatScreen } from './src/screens/RiwayatScreen';
import { ProdukScreen } from './src/screens/ProdukScreen';
import { LainnyaScreen } from './src/screens/LainnyaScreen';
import { CashierIcon, CartIcon, HistoryIcon, ProductIcon, MoreIcon } from './src/components/Icons';
import { TabType } from './src/types';

function MainLayout() {
  const { activeTab, setActiveTab, cartTotalQty, transactions } = usePOS();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const renderScreen = () => {
    switch (activeTab) {
      case 'kasir':
        return <KasirScreen />;
      case 'keranjang':
        return <KeranjangScreen />;
      case 'riwayat':
        return <RiwayatScreen />;
      case 'produk':
        return <ProdukScreen />;
      case 'lainnya':
        return <LainnyaScreen />;
      default:
        return <KasirScreen />;
    }
  };

  const mobileNavItems: { key: TabType; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; badge?: number }[] = [
    { key: 'kasir', label: 'Kasir', icon: CashierIcon },
    { key: 'keranjang', label: 'Keranjang', icon: CartIcon, badge: cartTotalQty },
    { key: 'riwayat', label: 'Riwayat', icon: HistoryIcon, badge: transactions.length },
    { key: 'produk', label: 'Produk', icon: ProductIcon },
    { key: 'lainnya', label: 'Lainnya', icon: MoreIcon },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.rootContainer}>
        {/* Desktop / Tablet Sidebar */}
        {isDesktop && <Sidebar />}

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          <Header />
          <View style={styles.screenWrapper}>
            {renderScreen()}
          </View>

          {/* Mobile Bottom Navigation (Visible on phones) */}
          {!isDesktop && (
            <View style={styles.bottomNav}>
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    onPress={() => setActiveTab(item.key)}
                    style={styles.bottomNavItem}
                  >
                    <View style={styles.bottomIconWrapper}>
                      <Icon size={20} color={isActive ? '#10b981' : '#94a3b8'} />
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <View style={styles.bottomBadge}>
                          <Text style={styles.bottomBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.bottomNavText, isActive && styles.bottomNavTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
  },
  screenWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  bottomIconWrapper: {
    position: 'relative',
  },
  bottomBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#059669',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomNavText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 3,
  },
  bottomNavTextActive: {
    color: '#34d399',
    fontWeight: '700',
  },
});
