import React from 'react';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

export const CashierIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff', style }) => (
  <MaterialIcons name="point-of-sale" size={size} color={color} style={style} />
);

export const CartIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff', style }) => (
  <Ionicons name="cart-outline" size={size} color={color} style={style} />
);

export const HistoryIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff', style }) => (
  <Ionicons name="time-outline" size={size} color={color} style={style} />
);

export const ProductIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff', style }) => (
  <Ionicons name="pricetags-outline" size={size} color={color} style={style} />
);

export const MoreIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff', style }) => (
  <Ionicons name="grid-outline" size={size} color={color} style={style} />
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = '#94a3b8', style }) => (
  <Ionicons name="search-outline" size={size} color={color} style={style} />
);

export const PlusIcon: React.FC<IconProps> = ({ size = 16, color = '#ffffff', style }) => (
  <Ionicons name="add" size={size} color={color} style={style} />
);

export const MinusIcon: React.FC<IconProps> = ({ size = 16, color = '#ffffff', style }) => (
  <Ionicons name="remove" size={size} color={color} style={style} />
);

export const TrashIcon: React.FC<IconProps> = ({ size = 16, color = '#94a3b8', style }) => (
  <Ionicons name="trash-outline" size={size} color={color} style={style} />
);

export const CheckIcon: React.FC<IconProps> = ({ size = 18, color = '#ffffff', style }) => (
  <Ionicons name="checkmark" size={size} color={color} style={style} />
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, color = '#94a3b8', style }) => (
  <Ionicons name="close" size={size} color={color} style={style} />
);

export const EditIcon: React.FC<IconProps> = ({ size = 16, color = '#64748b', style }) => (
  <Feather name="edit-2" size={size} color={color} style={style} />
);

export const BarcodeIcon: React.FC<IconProps> = ({ size = 18, color = '#0f172a', style }) => (
  <Ionicons name="barcode-outline" size={size} color={color} style={style} />
);
