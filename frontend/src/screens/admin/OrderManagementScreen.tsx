import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import orderService from '../../services/order.service';
import { Order, OrderStatus, Product } from '../../types';

const OrderManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      await orderService.updateStatus(selectedOrder._id, newStatus);
      Alert.alert('Success', 'Order status updated successfully');
      setDetailsModalVisible(false);
      loadOrders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { bg: '#fff3e0', text: '#f57c00' };
      case OrderStatus.CONFIRMED:
        return { bg: '#e3f2fd', text: '#2196f3' };
      case OrderStatus.PROCESSING:
        return { bg: '#f3e5f5', text: '#9c27b0' };
      case OrderStatus.SHIPPED:
        return { bg: '#e8eaf6', text: '#3f51b5' };
      case OrderStatus.DELIVERED:
        return { bg: '#e8f5e9', text: '#4caf50' };
      case OrderStatus.CANCELLED:
        return { bg: '#ffebee', text: '#f44336' };
      default:
        return { bg: '#f5f5f5', text: '#666' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProductName = (product: Product | string): string => {
    if (typeof product === 'string') return 'Unknown Product';
    return product.name;
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusColors = getStatusColor(item.status);
    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => openDetails(item)}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{item.orderId}</Text>
            <Text style={styles.customerName}>{item.user.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.orderAmount}>${item.totalAmount.toFixed(2)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.itemCount}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
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
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />

      {/* Order Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.detailsContainer}>
                {/* Order Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Order ID:</Text>
                    <Text style={styles.infoValue}>#{selectedOrder.orderId}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(selectedOrder.createdAt)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Amount:</Text>
                    <Text style={styles.infoValue}>${selectedOrder.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Customer Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{selectedOrder.user.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{selectedOrder.user.email}</Text>
                  </View>
                </View>

                {/* Shipping Address */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Shipping Address</Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.shippingAddress.fullName}
                  </Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.shippingAddress.addressLine1}
                  </Text>
                  {selectedOrder.shippingAddress.addressLine2 && (
                    <Text style={styles.addressText}>
                      {selectedOrder.shippingAddress.addressLine2}
                    </Text>
                  )}
                  <Text style={styles.addressText}>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.postalCode}
                  </Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.shippingAddress.country}
                  </Text>
                  <Text style={styles.addressText}>
                    Phone: {selectedOrder.shippingAddress.phone}
                  </Text>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>
                          {getProductName(item.product)}
                        </Text>
                        <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                      </View>
                      <View style={styles.orderItemPricing}>
                        <Text style={styles.orderItemPrice}>
                          ${item.price.toFixed(2)} each
                        </Text>
                        <Text style={styles.orderItemSubtotal}>
                          ${item.subtotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Status Update */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Update Status</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedOrder.status}
                      onValueChange={(value) => handleStatusUpdate(value as OrderStatus)}
                      enabled={!updatingStatus}
                      style={styles.picker}
                    >
                      <Picker.Item label="Pending" value={OrderStatus.PENDING} />
                      <Picker.Item label="Confirmed" value={OrderStatus.CONFIRMED} />
                      <Picker.Item label="Processing" value={OrderStatus.PROCESSING} />
                      <Picker.Item label="Shipped" value={OrderStatus.SHIPPED} />
                      <Picker.Item label="Delivered" value={OrderStatus.DELIVERED} />
                      <Picker.Item label="Cancelled" value={OrderStatus.CANCELLED} />
                    </Picker>
                  </View>
                  {updatingStatus && (
                    <ActivityIndicator size="small" color="#6200ee" style={styles.statusLoader} />
                  )}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
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
  detailsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#666',
  },
  orderItemPricing: {
    alignItems: 'flex-end',
  },
  orderItemPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderItemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerWrapper: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  statusLoader: {
    marginTop: 12,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default OrderManagementScreen;
