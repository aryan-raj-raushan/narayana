import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
  showWishlist?: boolean;
  onBack?: () => void;
  onCartPress?: () => void;
  onWishlistPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Narayana',
  showBack = false,
  showCart = true,
  showWishlist = true,
  onBack,
  onCartPress,
  onWishlistPress,
}) => {
  const cartCount = useCartStore((state) => state.count);
  const wishlistCount = useWishlistStore((state) => state.count);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {showWishlist && (
          <TouchableOpacity onPress={onWishlistPress} style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color={colors.primary} />
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {showCart && (
          <TouchableOpacity onPress={onCartPress} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
