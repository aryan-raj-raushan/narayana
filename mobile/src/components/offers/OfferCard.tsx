import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Offer } from '../../types';
import { colors } from '../../lib/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface OfferCardProps {
    offer: Offer;
    onPress: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            <ImageBackground
                source={{ uri: offer.image || 'https://via.placeholder.com/400x300' }}
                style={styles.imageBackground}
                imageStyle={styles.image}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        {offer.homepageSubtitle && (
                            <Text style={styles.subtitle}>{offer.homepageSubtitle}</Text>
                        )}
                        {offer.homepagePrice && (
                            <Text style={styles.price}>{offer.homepagePrice}</Text>
                        )}
                        {offer.homepageCategory && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{offer.homepageCategory}</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 200,
        marginRight: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    imageBackground: {
        width: '100%',
        height: '100%',
    },
    image: {
        borderRadius: 16,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
    },
    content: {
        gap: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    price: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
    },
});
