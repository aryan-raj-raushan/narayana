import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Subcategory } from '../../types';
import { colors } from '../../lib/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface CategoryCardProps {
    category: Subcategory;
    onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    const imageUrl = category.image || 'https://via.placeholder.com/200';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <Text style={styles.name} numberOfLines={2}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        aspectRatio: 1,
        backgroundColor: colors.lightBackground,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        padding: 12,
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
