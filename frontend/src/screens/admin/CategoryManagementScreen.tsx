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
  Divider as PaperDivider,
} from 'react-native-paper';
import categoryService from '../../services/category.service';
import genderService from '../../services/gender.service';
import { Category, Gender, CreateCategoryDto } from '../../types';

const CategoryManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    gender: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, gendersData] = await Promise.all([
        categoryService.getAll(),
        genderService.getAll(),
      ]);
      setCategories(categoriesData);
      setGenders(gendersData.filter((g) => g.isActive));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }
    if (!formData.gender) {
      Alert.alert('Error', 'Please select a gender');
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await categoryService.update(editingCategory._id, formData);
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await categoryService.create(formData);
        Alert.alert('Success', 'Category created successfully');
      }
      setDialogVisible(false);
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      gender: typeof category.gender === 'string' ? category.gender : category.gender._id,
      isActive: category.isActive,
    });
    setDialogVisible(true);
  };

  const handleDelete = (category: Category) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
        performDelete(category._id);
      }
    } else {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${category.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => performDelete(category._id), style: 'destructive' },
        ]
      );
    }
  };

  const performDelete = async (id: string) => {
    try {
      setLoading(true);
      await categoryService.delete(id);
      Alert.alert('Success', 'Category deleted successfully');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      gender: '',
      isActive: true,
    });
  };

  const getGenderName = (genderId: string): string => {
    const gender = genders.find((g) => g._id === genderId);
    return gender?.name || 'Unknown';
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const genderName =
      typeof item.gender === 'string' ? getGenderName(item.gender) : item.gender.name;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall" style={styles.genderBadge}>
                Gender: {genderName}
              </Text>
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
  };

  return (
    <View style={styles.container}>
      {loading && categories.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text>No categories found. Add your first category!</Text>
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
          <Dialog.Title>{editingCategory ? 'Edit Category' : 'Add Category'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={styles.dialogContent}>
                <TextInput
                  label="Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  mode="outlined"
                  style={styles.input}
                />

                <Menu
                  visible={genderMenuVisible}
                  onDismiss={() => setGenderMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setGenderMenuVisible(true)}
                      style={styles.input}
                    >
                      {formData.gender
                        ? getGenderName(formData.gender)
                        : 'Select Gender *'}
                    </Button>
                  }
                >
                  {genders.map((gender) => (
                    <Menu.Item
                      key={gender._id}
                      onPress={() => {
                        setFormData({ ...formData, gender: gender._id });
                        setGenderMenuVisible(false);
                      }}
                      title={gender.name}
                    />
                  ))}
                </Menu>

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
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  genderBadge: {
    marginTop: 4,
    color: '#6200ee',
    fontWeight: '600',
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
  },
});

export default CategoryManagementScreen;
