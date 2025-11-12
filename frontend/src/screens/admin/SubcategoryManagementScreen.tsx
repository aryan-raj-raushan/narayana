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
} from 'react-native-paper';
import subcategoryService from '../../services/subcategory.service';
import categoryService from '../../services/category.service';
import { Subcategory, Category, CreateSubcategoryDto } from '../../types';

const SubcategoryManagementScreen: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState<CreateSubcategoryDto>({
    name: '',
    description: '',
    category: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subcategoriesData, categoriesData] = await Promise.all([
        subcategoryService.getAll(),
        categoryService.getAll(),
      ]);
      setSubcategories(subcategoriesData);
      setCategories(categoriesData.filter((c) => c.isActive));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter subcategory name');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setLoading(true);
      if (editingSubcategory) {
        await subcategoryService.update(editingSubcategory._id, formData);
        Alert.alert('Success', 'Subcategory updated successfully');
      } else {
        await subcategoryService.create(formData);
        Alert.alert('Success', 'Subcategory created successfully');
      }
      setDialogVisible(false);
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      category:
        typeof subcategory.category === 'string'
          ? subcategory.category
          : subcategory.category._id,
      isActive: subcategory.isActive,
    });
    setDialogVisible(true);
  };

  const handleDelete = (subcategory: Subcategory) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${subcategory.name}"?`)) {
        performDelete(subcategory._id);
      }
    } else {
      Alert.alert(
        'Delete Subcategory',
        `Are you sure you want to delete "${subcategory.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: () => performDelete(subcategory._id),
            style: 'destructive',
          },
        ]
      );
    }
  };

  const performDelete = async (id: string) => {
    try {
      setLoading(true);
      await subcategoryService.delete(id);
      Alert.alert('Success', 'Subcategory deleted successfully');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete subcategory');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingSubcategory(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      isActive: true,
    });
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c._id === categoryId);
    return category?.name || 'Unknown';
  };

  const renderSubcategory = ({ item }: { item: Subcategory }) => {
    const categoryName =
      typeof item.category === 'string' ? getCategoryName(item.category) : item.category.name;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall" style={styles.categoryBadge}>
                Category: {categoryName}
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
      {loading && subcategories.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={subcategories}
          renderItem={renderSubcategory}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text>No subcategories found. Add your first subcategory!</Text>
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
          <Dialog.Title>
            {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
          </Dialog.Title>
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
                  visible={categoryMenuVisible}
                  onDismiss={() => setCategoryMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setCategoryMenuVisible(true)}
                      style={styles.input}
                    >
                      {formData.category
                        ? getCategoryName(formData.category)
                        : 'Select Category *'}
                    </Button>
                  }
                >
                  {categories.map((category) => (
                    <Menu.Item
                      key={category._id}
                      onPress={() => {
                        setFormData({ ...formData, category: category._id });
                        setCategoryMenuVisible(false);
                      }}
                      title={category.name}
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
  categoryBadge: {
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

export default SubcategoryManagementScreen;
