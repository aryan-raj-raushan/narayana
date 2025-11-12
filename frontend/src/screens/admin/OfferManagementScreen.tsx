import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  FAB,
  Card,
  IconButton,
  Portal,
  Dialog,
  TextInput,
  Button,
  Switch,
  ActivityIndicator,
  Menu,
  Chip,
} from 'react-native-paper';
import offerService from '../../services/offer.service';
import { Offer, OfferType, CreateOfferDto } from '../../types';

const OfferManagementScreen: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<CreateOfferDto>({
    name: '',
    description: '',
    offerType: OfferType.PERCENTAGE_OFF,
    rule: {},
    isActive: true,
    priority: 1,
  });

  const offerTypes = [
    { value: OfferType.BUY_X_GET_Y, label: 'Buy X Get Y' },
    { value: OfferType.BUNDLE_DISCOUNT, label: 'Bundle Discount' },
    { value: OfferType.PERCENTAGE_OFF, label: 'Percentage Off' },
    { value: OfferType.FIXED_AMOUNT_OFF, label: 'Fixed Amount Off' },
  ];

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offerService.getAll();
      setOffers(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter offer name');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter offer description');
      return;
    }

    // Validate rule based on offer type
    if (formData.offerType === OfferType.BUY_X_GET_Y) {
      if (!formData.rule.buyQuantity || !formData.rule.getQuantity) {
        Alert.alert('Error', 'Please enter buy and get quantities');
        return;
      }
    } else if (formData.offerType === OfferType.BUNDLE_DISCOUNT) {
      if (!formData.rule.bundlePrice || !formData.rule.minQuantity) {
        Alert.alert('Error', 'Please enter bundle price and minimum quantity');
        return;
      }
    } else if (formData.offerType === OfferType.PERCENTAGE_OFF) {
      if (!formData.rule.discountPercentage) {
        Alert.alert('Error', 'Please enter discount percentage');
        return;
      }
    } else if (formData.offerType === OfferType.FIXED_AMOUNT_OFF) {
      if (!formData.rule.discountAmount) {
        Alert.alert('Error', 'Please enter discount amount');
        return;
      }
    }

    try {
      setLoading(true);
      if (editingOffer) {
        await offerService.update(editingOffer._id, formData);
        Alert.alert('Success', 'Offer updated successfully');
      } else {
        await offerService.create(formData);
        Alert.alert('Success', 'Offer created successfully');
      }
      setDialogVisible(false);
      resetForm();
      loadOffers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save offer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      offerType: offer.offerType,
      rule: offer.rule,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isActive: offer.isActive,
      usageLimit: offer.usageLimit,
      priority: offer.priority,
    });
    setDialogVisible(true);
  };

  const handleDelete = (offer: Offer) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${offer.name}"?`)) {
        performDelete(offer._id);
      }
    } else {
      Alert.alert('Delete Offer', `Are you sure you want to delete "${offer.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => performDelete(offer._id), style: 'destructive' },
      ]);
    }
  };

  const performDelete = async (id: string) => {
    try {
      setLoading(true);
      await offerService.delete(id);
      Alert.alert('Success', 'Offer deleted successfully');
      loadOffers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete offer');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      name: '',
      description: '',
      offerType: OfferType.PERCENTAGE_OFF,
      rule: {},
      isActive: true,
      priority: 1,
    });
  };

  const getOfferTypeLabel = (type: OfferType): string => {
    return offerTypes.find((t) => t.value === type)?.label || type;
  };

  const renderOfferDetails = (offer: Offer): string => {
    switch (offer.offerType) {
      case OfferType.BUY_X_GET_Y:
        return `Buy ${offer.rule.buyQuantity} Get ${offer.rule.getQuantity} Free`;
      case OfferType.BUNDLE_DISCOUNT:
        return `${offer.rule.minQuantity} for ₹${offer.rule.bundlePrice}`;
      case OfferType.PERCENTAGE_OFF:
        return `${offer.rule.discountPercentage}% Off`;
      case OfferType.FIXED_AMOUNT_OFF:
        return `₹${offer.rule.discountAmount} Off`;
      default:
        return '';
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.offerInfo}>
            <Text variant="titleMedium">{item.name}</Text>
            <Chip mode="flat" style={styles.typeChip}>
              {getOfferTypeLabel(item.offerType)}
            </Chip>
            <Text variant="bodyMedium" style={styles.offerDetails}>
              {renderOfferDetails(item)}
            </Text>
            <Text variant="bodySmall" style={styles.description}>
              {item.description}
            </Text>
            <View style={styles.badges}>
              <Chip mode="flat" style={styles.priorityChip}>
                Priority: {item.priority}
              </Chip>
              {item.usageLimit && (
                <Chip mode="flat">
                  Used: {item.usageCount}/{item.usageLimit}
                </Chip>
              )}
              <Chip mode="flat">{item.isActive ? 'Active' : 'Inactive'}</Chip>
            </View>
          </View>
          <View style={styles.actions}>
            <IconButton icon="pencil" onPress={() => handleEdit(item)} />
            <IconButton icon="delete" onPress={() => handleDelete(item)} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRuleFields = () => {
    switch (formData.offerType) {
      case OfferType.BUY_X_GET_Y:
        return (
          <>
            <TextInput
              label="Buy Quantity *"
              value={formData.rule.buyQuantity?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, buyQuantity: parseInt(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Get Quantity (Free) *"
              value={formData.rule.getQuantity?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, getQuantity: parseInt(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        );
      case OfferType.BUNDLE_DISCOUNT:
        return (
          <>
            <TextInput
              label="Minimum Quantity *"
              value={formData.rule.minQuantity?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, minQuantity: parseInt(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Bundle Price *"
              value={formData.rule.bundlePrice?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, bundlePrice: parseFloat(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        );
      case OfferType.PERCENTAGE_OFF:
        return (
          <>
            <TextInput
              label="Discount Percentage *"
              value={formData.rule.discountPercentage?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, discountPercentage: parseFloat(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Minimum Quantity"
              value={formData.rule.minQuantity?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, minQuantity: parseInt(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        );
      case OfferType.FIXED_AMOUNT_OFF:
        return (
          <>
            <TextInput
              label="Discount Amount *"
              value={formData.rule.discountAmount?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, discountAmount: parseFloat(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Minimum Quantity"
              value={formData.rule.minQuantity?.toString() || ''}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  rule: { ...formData.rule, minQuantity: parseInt(text) || undefined },
                })
              }
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {loading && offers.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOffer}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text>No offers found. Create your first offer!</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          resetForm();
          setDialogVisible(true);
        }}
      />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{editingOffer ? 'Edit Offer' : 'Create Offer'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={styles.dialogContent}>
                <TextInput
                  label="Offer Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Description *"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />

                <Menu
                  visible={typeMenuVisible}
                  onDismiss={() => setTypeMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setTypeMenuVisible(true)}
                      style={styles.input}
                    >
                      {getOfferTypeLabel(formData.offerType)}
                    </Button>
                  }
                >
                  {offerTypes.map((type) => (
                    <Menu.Item
                      key={type.value}
                      onPress={() => {
                        setFormData({ ...formData, offerType: type.value, rule: {} });
                        setTypeMenuVisible(false);
                      }}
                      title={type.label}
                    />
                  ))}
                </Menu>

                {renderRuleFields()}

                <TextInput
                  label="Usage Limit"
                  value={formData.usageLimit?.toString() || ''}
                  onChangeText={(text) =>
                    setFormData({ ...formData, usageLimit: parseInt(text) || undefined })
                  }
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TextInput
                  label="Priority"
                  value={formData.priority?.toString() || '1'}
                  onChangeText={(text) =>
                    setFormData({ ...formData, priority: parseInt(text) || 1 })
                  }
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <View style={styles.switchRow}>
                  <Text>Active</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  />
                </View>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSave} loading={loading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerInfo: {
    flex: 1,
  },
  typeChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
  },
  offerDetails: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  description: {
    marginTop: 4,
    color: '#666',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  priorityChip: {
    backgroundColor: '#fff3e0',
  },
  actions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    maxHeight: '90%',
  },
  dialogContent: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
});

export default OfferManagementScreen;
