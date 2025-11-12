import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
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
} from 'react-native-paper';
import genderService from '../../services/gender.service';
import { Gender, CreateGenderDto } from '../../types';

const GenderManagementScreen: React.FC = () => {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingGender, setEditingGender] = useState<Gender | null>(null);
  const [formData, setFormData] = useState<CreateGenderDto>({
    name: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadGenders();
  }, []);

  const loadGenders = async () => {
    try {
      setLoading(true);
      const data = await genderService.getAll();
      setGenders(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load genders');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter gender name');
      return;
    }

    try {
      setLoading(true);
      if (editingGender) {
        await genderService.update(editingGender._id, formData);
        Alert.alert('Success', 'Gender updated successfully');
      } else {
        await genderService.create(formData);
        Alert.alert('Success', 'Gender created successfully');
      }
      setDialogVisible(false);
      resetForm();
      loadGenders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save gender');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gender: Gender) => {
    setEditingGender(gender);
    setFormData({
      name: gender.name,
      description: gender.description || '',
      isActive: gender.isActive,
    });
    setDialogVisible(true);
  };

  const handleDelete = (gender: Gender) => {
    const alertFn = Platform.OS === 'web' ? window.confirm : Alert.alert;

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${gender.name}"?`)) {
        performDelete(gender._id);
      }
    } else {
      Alert.alert(
        'Delete Gender',
        `Are you sure you want to delete "${gender.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => performDelete(gender._id), style: 'destructive' },
        ]
      );
    }
  };

  const performDelete = async (id: string) => {
    try {
      setLoading(true);
      await genderService.delete(id);
      Alert.alert('Success', 'Gender deleted successfully');
      loadGenders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete gender');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingGender(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
  };

  const renderGender = ({ item }: { item: Gender }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text variant="titleMedium">{item.name}</Text>
            {item.description && (
              <Text variant="bodySmall" style={styles.description}>
                {item.description}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.status}>
              Status: {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton icon="pencil" onPress={() => handleEdit(item)} />
            <IconButton icon="delete" onPress={() => handleDelete(item)} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading && genders.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={genders}
          renderItem={renderGender}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text>No genders found. Add your first gender!</Text>
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
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingGender ? 'Edit Gender' : 'Add Gender'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <View style={styles.switchRow}>
              <Text>Active</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
              />
            </View>
          </Dialog.Content>
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
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  description: {
    marginTop: 4,
    color: '#666',
  },
  status: {
    marginTop: 4,
    color: '#999',
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
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default GenderManagementScreen;
