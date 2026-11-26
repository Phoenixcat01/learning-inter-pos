import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePOS } from '../context/POSContext';
import { useAuth } from '../context/AuthContext';
import { TabType } from '../types';
import { CashierIcon, CartIcon, HistoryIcon, ProductIcon, MoreIcon, LogoutIcon } from './Icons';

interface NavItem {
  key: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, cartTotalQty, transactions } = usePOS();
  const { user, signOut } = useAuth();

  const navItems: NavItem[] = [
    { key: 'kasir', label: 'Kasir', icon: CashierIcon },
    { key: 'keranjang', label: 'Keranjang', icon: CartIcon, badge: cartTotalQty },
    { key: 'riwayat', label: 'Riwayat', icon: HistoryIcon, badge: transactions.length },
    { key: 'produk', label: 'Produk', icon: ProductIcon },
    { key: 'lainnya', label: 'Lainnya', icon: MoreIcon },
  ];

  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View>
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <CashierIcon size={22} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Belajar POS</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.brandSubtitle}>Expo Hybrid POS</Text>
            </View>
          </View>
        </View>

        {/* Navigation Links */}
        <View style={styles.navContainer}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                onPress={() => setActiveTab(item.key)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <View style={styles.navItemLeft}>
                  <Icon size={20} color={isActive ? '#ffffff' : '#94a3b8'} />
                  <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </View>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <View style={[styles.badge, isActive && styles.badgeActive]}>
                    <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer Info & User Profile */}
      <View style={styles.footerContainer}>
        {user && (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.nama}
              </Text>
              <Text style={styles.userRole} numberOfLines={1}>
                {user.role ? user.role.toUpperCase() : 'KASIR'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={signOut}
              style={styles.logoutButton}
              accessibilityLabel="Keluar / Logout"
            >
              <LogoutIcon size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Point of Sale v1.0</Text>
          <Text style={styles.footerSubtitle}>Expo Go & Web Ready</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: '#0f172a', // slate-900
    borderRightWidth: 1,
    borderRightColor: '#1e293b', // slate-800
    justifyContent: 'space-between',
    height: '100%',
  },
  brandHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#059669', // emerald-600
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  navContainer: {
    padding: 12,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#059669',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  navItemTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  badgeActive: {
    backgroundColor: '#ffffff',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  badgeTextActive: {
    color: '#059669',
  },
  footerContainer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 8,
    gap: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  userRole: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  footerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  footerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});
