import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';
import { Gender, Category, Subcategory } from '../../types';
import { useDataStore } from '../../store/dataStore';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    initialFilters?: FilterValues;
}

export interface FilterValues {
    genderId?: string;
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    onApply,
    initialFilters,
}) => {
    const {
        genders,
        categoriesByGender,
        subcategoriesByCategory,
        fetchGenders,
        fetchCategoriesByGender,
        fetchSubcategoriesByCategory,
    } = useDataStore();

    const [selectedGenderId, setSelectedGenderId] = useState<string | undefined>(
        initialFilters?.genderId
    );
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
        initialFilters?.categoryId
    );
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>(
        initialFilters?.subcategoryId
    );
    const [minPrice, setMinPrice] = useState<string>(
        initialFilters?.minPrice?.toString() || ''
    );
    const [maxPrice, setMaxPrice] = useState<string>(
        initialFilters?.maxPrice?.toString() || ''
    );

    const categories = selectedGenderId ? categoriesByGender[selectedGenderId] || [] : [];
    const subcategories = selectedCategoryId
        ? subcategoriesByCategory[selectedCategoryId] || []
        : [];

    useEffect(() => {
        if (visible) {
            fetchGenders();
        }
    }, [visible]);

    useEffect(() => {
        if (selectedGenderId) {
            fetchCategoriesByGender(selectedGenderId);
        }
    }, [selectedGenderId]);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchSubcategoriesByCategory(selectedCategoryId);
        }
    }, [selectedCategoryId]);

    const handleGenderSelect = (genderId: string) => {
        setSelectedGenderId(genderId === selectedGenderId ? undefined : genderId);
        setSelectedCategoryId(undefined);
        setSelectedSubcategoryId(undefined);
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId === selectedCategoryId ? undefined : categoryId);
        setSelectedSubcategoryId(undefined);
    };

    const handleSubcategorySelect = (subcategoryId: string) => {
        setSelectedSubcategoryId(
            subcategoryId === selectedSubcategoryId ? undefined : subcategoryId
        );
    };

    const handleApply = () => {
        const filters: FilterValues = {
            genderId: selectedGenderId,
            categoryId: selectedCategoryId,
            subcategoryId: selectedSubcategoryId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        };
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setSelectedGenderId(undefined);
        setSelectedCategoryId(undefined);
        setSelectedSubcategoryId(undefined);
        setMinPrice('');
        setMaxPrice('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Filters</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Gender Filter */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gender</Text>
                        <View style={styles.chipContainer}>
                            {genders.map((gender) => (
                                <TouchableOpacity
                                    key={gender._id}
                                    style={[
                                        styles.chip,
                                        selectedGenderId === gender._id && styles.chipSelected,
                                    ]}
                                    onPress={() => handleGenderSelect(gender._id)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            selectedGenderId === gender._id && styles.chipTextSelected,
                                        ]}
                                    >
                                        {gender.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Category Filter */}
                    {selectedGenderId && categories.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Category</Text>
                            <View style={styles.chipContainer}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category._id}
                                        style={[
                                            styles.chip,
                                            selectedCategoryId === category._id && styles.chipSelected,
                                        ]}
                                        onPress={() => handleCategorySelect(category._id)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                selectedCategoryId === category._id && styles.chipTextSelected,
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Subcategory Filter */}
                    {selectedCategoryId && subcategories.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Subcategory</Text>
                            <View style={styles.chipContainer}>
                                {subcategories.map((subcategory) => (
                                    <TouchableOpacity
                                        key={subcategory._id}
                                        style={[
                                            styles.chip,
                                            selectedSubcategoryId === subcategory._id && styles.chipSelected,
                                        ]}
                                        onPress={() => handleSubcategorySelect(subcategory._id)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                selectedSubcategoryId === subcategory._id &&
                                                styles.chipTextSelected,
                                            ]}
                                        >
                                            {subcategory.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Price Range Filter */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Price Range</Text>
                        <View style={styles.priceContainer}>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.priceLabel}>Min</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="₹0"
                                    keyboardType="numeric"
                                    value={minPrice}
                                    onChangeText={setMinPrice}
                                />
                            </View>
                            <Text style={styles.priceSeparator}>-</Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.priceLabel}>Max</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="₹10000"
                                    keyboardType="numeric"
                                    value={maxPrice}
                                    onChangeText={setMaxPrice}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: '#fff',
    },
    chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
    chipTextSelected: {
        color: '#fff',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    priceInputContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.secondary,
        marginBottom: 6,
    },
    priceInput: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.primary,
        backgroundColor: '#fff',
    },
    priceSeparator: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.secondary,
        marginTop: 20,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        backgroundColor: '#fff',
    },
    clearButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    applyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
