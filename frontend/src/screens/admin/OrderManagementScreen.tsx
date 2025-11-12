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
  Card,
  ActivityIndicator,
  Chip,
  Portal,
  Dialog,
  Button,
  Menu,
} from 'react-native-paper';
import orderService from '../../services/order.service';
import { Order, OrderStatus } from '../../types';

const OrderManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);

  const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '#ff9800',
    [OrderStatus.CONFIRMED]: '#2196f3',
    [OrderStatus.PROCESSING]: '#9c27b0',
    [OrderStatus.SHIPPED]: '#3f51b5',
    [OrderStatus.DELIVERED]: '#4caf50',
    [OrderStatus.CANCELLED]: '#f44336',
  };

  const statusOptions = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDialogVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      await orderService.updateStatus(selectedOrder._id, newStatus);
      Alert.alert('Success', 'Order status updated successfully');
      setDialogVisible(false);
      loadOrders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.card} onPress={() => handleViewOrder(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text variant="titleMedium">Order #{item.orderId}</Text>
            <Text variant="bodyMedium" style={styles.customerName}>
              {item.user.name}
            </Text>
            <Text variant="bodySmall" style={styles.email}>
              {item.user.email}
            </Text>
            <Text variant="bodyMedium" style={styles.amount}>
              Total: ₹{item.totalAmount.toFixed(2)}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: statusColors[item.status] }]}
            textStyle={styles.statusText}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading && orders.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text>No orders found.</Text>
            </View>
          }
        />
      )}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Order Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {selectedOrder && (
                <View style={styles.dialogContent}>
                  <Text variant="titleMedium">Order #{selectedOrder.orderId}</Text>

                  <View style={styles.section}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      Customer Information
                    </Text>
                    <Text>Name: {selectedOrder.user.name}</Text>
                    <Text>Email: {selectedOrder.user.email}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      Shipping Address
                    </Text>
                    <Text>{selectedOrder.shippingAddress.fullName}</Text>
                    <Text>{selectedOrder.shippingAddress.phone}</Text>
                    <Text>{selectedOrder.shippingAddress.addressLine1}</Text>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <Text>{selectedOrder.shippingAddress.addressLine2}</Text>
                    )}
                    <Text>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                      {selectedOrder.shippingAddress.postalCode}
                    </Text>
                    <Text>{selectedOrder.shippingAddress.country}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      Order Items
                    </Text>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <Text>
                          {typeof item.product === 'string' ? 'Product' : item.product.name}
                        </Text>
                        <Text>Quantity: {item.quantity}</Text>
                        <Text>Price: ₹{item.price}</Text>
                        <Text>Subtotal: ₹{item.subtotal}</Text>
                      </View>
                    ))}
                    <Text variant="titleMedium" style={styles.total}>
                      Total: ₹{selectedOrder.totalAmount.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      Update Status
                    </Text>
                    <Menu
                      visible={statusMenuVisible}
                      onDismiss={() => setStatusMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setStatusMenuVisible(true)}
                          style={styles.statusButton}
                        >
                          {newStatus.toUpperCase()}
                        </Button>
                      }
                    >
                      {statusOptions.map((status) => (
                        <Menu.Item
                          key={status}
                          onPress={() => {
                            setNewStatus(status);
                            setStatusMenuVisible(false);
                          }}
                          title={status.toUpperCase()}
                        />
                      ))}
                    </Menu>
                  </View>

                  <Text variant="bodySmall" style={styles.timestamps}>
                    Created: {formatDate(selectedOrder.createdAt)}
                    {'\n'}
                    Updated: {formatDate(selectedOrder.updatedAt)}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Close</Button>
            <Button onPress={handleUpdateStatus} loading={loading}>
              Update Status
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
  orderInfo: {
    flex: 1,
  },
  customerName: {
    marginTop: 4,
    fontWeight: '600',
  },
  email: {
    color: '#666',
    marginTop: 2,
  },
  amount: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  date: {
    marginTop: 4,
    color: '#999',
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
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
    paddingVertical: 8,
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderItem: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 8,
  },
  total: {
    marginTop: 12,
    textAlign: 'right',
    color: '#2196f3',
  },
  statusButton: {
    marginTop: 8,
  },
  timestamps: {
    marginTop: 16,
    color: '#999',
  },
});

export default OrderManagementScreen;
