import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import offerService from '../../services/offer.service';
import productService from '../../services/product.service';
import { Offer, CreateOfferDto, OfferType, OfferRule, Product } from '../../types';

const OfferManagementScreen: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [offerTypeModalVisible, setOfferTypeModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateOfferDto>({
    name: '',
    description: '',
    offerType: OfferType.PERCENTAGE_OFF,
    rule: {},
    isActive: true,
    priority: 1,
    applicableProducts: [],
  });

  useEffect(() => {
    loadOffers();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll({ page: 1, limit: 1000 });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offerService.getAll();
      setOffers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setSelectedProductIds(offer.applicableProducts || []);
      setFormData({
        name: offer.name,
        description: offer.description,
        offerType: offer.offerType,
        rule: offer.rule,
        usageLimit: offer.usageLimit,
        priority: offer.priority,
        isActive: offer.isActive,
        applicableProducts: offer.applicableProducts || [],
        startDate: offer.startDate,
        endDate: offer.endDate,
      });
    } else {
      setEditingOffer(null);
      setSelectedProductIds([]);
      setFormData({
        name: '',
        description: '',
        offerType: OfferType.PERCENTAGE_OFF,
        rule: {},
        isActive: true,
        priority: 1,
        applicableProducts: [],
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!validateRules()) {
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        applicableProducts: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      };

      if (editingOffer) {
        await offerService.update(editingOffer._id, dataToSubmit);
        Alert.alert('Success', 'Offer updated successfully');
      } else {
        await offerService.create(dataToSubmit);
        Alert.alert('Success', 'Offer created successfully');
      }
      setModalVisible(false);
      loadOffers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const getSelectedProductNames = () => {
    if (selectedProductIds.length === 0) return 'All Products';
    if (selectedProductIds.length === 1) {
      const product = products.find((p) => p._id === selectedProductIds[0]);
      return product ? product.name : '1 product selected';
    }
    return `${selectedProductIds.length} products selected`;
  };

  const validateRules = (): boolean => {
    const { offerType, rule } = formData;

    switch (offerType) {
      case OfferType.BUY_X_GET_Y:
        if (!rule.buyQuantity || !rule.getQuantity) {
          Alert.alert('Error', 'Please enter buy and get quantities');
          return false;
        }
        break;
      case OfferType.BUNDLE_DISCOUNT:
        if (!rule.minQuantity || !rule.bundlePrice) {
          Alert.alert('Error', 'Please enter minimum quantity and bundle price');
          return false;
        }
        break;
      case OfferType.PERCENTAGE_OFF:
        if (!rule.discountPercentage || rule.discountPercentage <= 0 || rule.discountPercentage > 100) {
          Alert.alert('Error', 'Please enter a valid discount percentage (1-100)');
          return false;
        }
        break;
      case OfferType.FIXED_AMOUNT_OFF:
        if (!rule.discountAmount || rule.discountAmount <= 0) {
          Alert.alert('Error', 'Please enter a valid discount amount');
          return false;
        }
        break;
    }
    return true;
  };

  const handleDelete = (offer: Offer) => {
    Alert.alert('Delete Offer', `Are you sure you want to delete "${offer.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await offerService.delete(offer._id);
            Alert.alert('Success', 'Offer deleted successfully');
            loadOffers();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete offer');
          }
        },
      },
    ]);
  };

  const updateRule = (field: keyof OfferRule, value: number) => {
    setFormData({
      ...formData,
      rule: { ...formData.rule, [field]: value },
    });
  };

  const getOfferTypeBadgeColor = (type: OfferType) => {
    switch (type) {
      case OfferType.BUY_X_GET_Y:
        return { bg: '#e3f2fd', text: '#2196f3' };
      case OfferType.BUNDLE_DISCOUNT:
        return { bg: '#f3e5f5', text: '#9c27b0' };
      case OfferType.PERCENTAGE_OFF:
        return { bg: '#fff3e0', text: '#f57c00' };
      case OfferType.FIXED_AMOUNT_OFF:
        return { bg: '#e8f5e9', text: '#4caf50' };
      default:
        return { bg: '#f5f5f5', text: '#666' };
    }
  };

  const getOfferTypeLabel = (type: OfferType) => {
    switch (type) {
      case OfferType.BUY_X_GET_Y:
        return 'Buy X Get Y';
      case OfferType.BUNDLE_DISCOUNT:
        return 'Bundle Discount';
      case OfferType.PERCENTAGE_OFF:
        return 'Percentage Off';
      case OfferType.FIXED_AMOUNT_OFF:
        return 'Fixed Amount Off';
      default:
        return type;
    }
  };

  const renderRuleFields = () => {
    const { offerType, rule } = formData;

    switch (offerType) {
      case OfferType.BUY_X_GET_Y:
        return (
          <>
            <Text style={styles.label}>Buy Quantity *</Text>
            <TextInput
              style={styles.input}
              value={rule.buyQuantity?.toString() || ''}
              onChangeText={(value) => updateRule('buyQuantity', parseInt(value) || 0)}
              placeholder="0"
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Get Quantity *</Text>
            <TextInput
              style={styles.input}
              value={rule.getQuantity?.toString() || ''}
              onChangeText={(value) => updateRule('getQuantity', parseInt(value) || 0)}
              placeholder="0"
              keyboardType="number-pad"
            />
          </>
        );

      case OfferType.BUNDLE_DISCOUNT:
        return (
          <>
            <Text style={styles.label}>Minimum Quantity *</Text>
            <TextInput
              style={styles.input}
              value={rule.minQuantity?.toString() || ''}
              onChangeText={(value) => updateRule('minQuantity', parseInt(value) || 0)}
              placeholder="0"
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Bundle Price *</Text>
            <TextInput
              style={styles.input}
              value={rule.bundlePrice?.toString() || ''}
              onChangeText={(value) => updateRule('bundlePrice', parseFloat(value) || 0)}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </>
        );

      case OfferType.PERCENTAGE_OFF:
        return (
          <>
            <Text style={styles.label}>Discount Percentage (%) *</Text>
            <TextInput
              style={styles.input}
              value={rule.discountPercentage?.toString() || ''}
              onChangeText={(value) => updateRule('discountPercentage', parseFloat(value) || 0)}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Minimum Quantity</Text>
            <TextInput
              style={styles.input}
              value={rule.minQuantity?.toString() || ''}
              onChangeText={(value) => updateRule('minQuantity', parseInt(value) || 0)}
              placeholder="0 (optional)"
              keyboardType="number-pad"
            />
          </>
        );

      case OfferType.FIXED_AMOUNT_OFF:
        return (
          <>
            <Text style={styles.label}>Discount Amount ($) *</Text>
            <TextInput
              style={styles.input}
              value={rule.discountAmount?.toString() || ''}
              onChangeText={(value) => updateRule('discountAmount', parseFloat(value) || 0)}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Minimum Quantity</Text>
            <TextInput
              style={styles.input}
              value={rule.minQuantity?.toString() || ''}
              onChangeText={(value) => updateRule('minQuantity', parseInt(value) || 0)}
              placeholder="0 (optional)"
              keyboardType="number-pad"
            />
          </>
        );

      default:
        return null;
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => {
    const typeColors = getOfferTypeBadgeColor(item.offerType);
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, item.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
          <Text style={[styles.typeText, { color: typeColors.text }]}>
            {getOfferTypeLabel(item.offerType)}
          </Text>
        </View>
        {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
        <View style={styles.offerMeta}>
          <Text style={styles.metaText}>Priority: {item.priority}</Text>
          {item.usageLimit && (
            <Text style={styles.metaText}>
              Usage: {item.usageCount}/{item.usageLimit}
            </Text>
          )}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
            <Ionicons name="create-outline" size={20} color="#2196f3" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={20} color="#f44336" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No offers found</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingOffer ? 'Edit Offer' : 'Add Offer'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                placeholder="Enter offer name"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Offer Type *</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setOfferTypeModalVisible(true)}
              >
                <Text style={styles.selectorButtonText}>
                  {getOfferTypeLabel(formData.offerType)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {renderRuleFields()}

              <Text style={styles.label}>Usage Limit</Text>
              <TextInput
                style={styles.input}
                value={formData.usageLimit?.toString() || ''}
                onChangeText={(value) => setFormData({ ...formData, usageLimit: parseInt(value) || undefined })}
                placeholder="Unlimited"
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Priority</Text>
              <TextInput
                style={styles.input}
                value={formData.priority?.toString() || '1'}
                onChangeText={(value) => setFormData({ ...formData, priority: parseInt(value) || 1 })}
                placeholder="1"
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Applicable Products</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setProductModalVisible(true)}
              >
                <Text style={styles.selectorButtonText}>
                  {getSelectedProductNames()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Start Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.startDate || ''}
                onChangeText={(value) => setFormData({ ...formData, startDate: value })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>End Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.endDate || ''}
                onChangeText={(value) => setFormData({ ...formData, endDate: value })}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  trackColor={{ false: '#ccc', true: '#b39ddb' }}
                  thumbColor={formData.isActive ? '#6200ee' : '#f4f3f4'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={offerTypeModalVisible} animationType="slide" transparent onRequestClose={() => setOfferTypeModalVisible(false)}>
        <View style={styles.selectorModalOverlay}>
          <View style={[styles.selectorModalContent, Platform.OS === 'web' && styles.selectorModalContentWeb]}>
            <View style={styles.selectorModalHeader}>
              <Text style={styles.selectorModalTitle}>Select Offer Type</Text>
              <TouchableOpacity onPress={() => setOfferTypeModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectorModalList}>
              {Object.values(OfferType).map((type) => {
                const colors = getOfferTypeBadgeColor(type);
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.selectorModalItem}
                    onPress={() => {
                      setFormData({ ...formData, offerType: type, rule: {} });
                      setOfferTypeModalVisible(false);
                    }}
                  >
                    <View style={styles.selectorModalItemContent}>
                      <View style={[styles.offerTypeIcon, { backgroundColor: colors.bg }]}>
                        <Ionicons name="pricetag" size={16} color={colors.text} />
                      </View>
                      <Text style={styles.selectorModalItemText}>{getOfferTypeLabel(type)}</Text>
                    </View>
                    {formData.offerType === type && (
                      <Ionicons name="checkmark" size={24} color="#6200ee" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={productModalVisible} animationType="slide" transparent onRequestClose={() => setProductModalVisible(false)}>
        <View style={styles.selectorModalOverlay}>
          <View style={[styles.selectorModalContent, Platform.OS === 'web' && styles.selectorModalContentWeb]}>
            <View style={styles.selectorModalHeader}>
              <Text style={styles.selectorModalTitle}>Select Products</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.productModalActions}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={() => setSelectedProductIds(products.map((p) => p._id))}
              >
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => setSelectedProductIds([])}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectorModalList}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.selectorModalItem}
                  onPress={() => toggleProductSelection(product._id)}
                >
                  <View style={styles.selectorModalItemContent}>
                    <Text style={styles.selectorModalItemText}>{product.name}</Text>
                    <Text style={styles.productSKU}>{product.sku}</Text>
                  </View>
                  {selectedProductIds.includes(product._id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={() => setProductModalVisible(false)}>
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#4caf50',
  },
  statusTextInactive: {
    color: '#f44336',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    color: '#f44336',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectorModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  selectorModalContentWeb: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    marginVertical: 'auto',
  },
  selectorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectorModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectorModalList: {
    padding: 8,
  },
  selectorModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  selectorModalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorModalItemText: {
    fontSize: 16,
    color: '#333',
  },
  offerTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  productModalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectAllButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
  },
  selectAllText: {
    color: '#2196f3',
    fontWeight: '600',
    fontSize: 14,
  },
  clearAllButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#ffebee',
    alignItems: 'center',
  },
  clearAllText: {
    color: '#f44336',
    fontWeight: '600',
    fontSize: 14,
  },
  productSKU: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default OfferManagementScreen;
