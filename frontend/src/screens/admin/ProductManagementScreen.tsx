import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ScrollView,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import productService from '../../services/product.service';
import genderService from '../../services/gender.service';
import categoryService from '../../services/category.service';
import subcategoryService from '../../services/subcategory.service';
import mediaService from '../../services/media.service';
import { Product, Gender, Category, Subcategory, CreateProductDto } from '../../types';

const ProductManagementScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [subcategoryMenuVisible, setSubcategoryMenuVisible] = useState(false);

  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    gender: '',
    category: '',
    subcategory: '',
    price: 0,
    stock: 0,
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: false,
    images: [],
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, gendersData, categoriesData, subcategoriesData] = await Promise.all([
        productService.getAll(),
        genderService.getAll(),
        categoryService.getAll(),
        subcategoryService.getAll(),
      ]);
      setProducts(productsData.data);
      setGenders(gendersData.filter((g) => g.isActive));
      setCategories(categoriesData.filter((c) => c.isActive));
      setSubcategories(subcategoriesData.filter((s) => s.isActive));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const imageUri of selectedImages) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = imageUri.split('/').pop() || 'image.jpg';

        const uploadResult = await mediaService.uploadImage(blob, fileName);
        uploadedUrls.push(uploadResult.url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return uploadedUrls;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }
    if (!formData.gender || !formData.category || !formData.subcategory) {
      Alert.alert('Error', 'Please select gender, category, and subcategory');
      return;
    }
    if (formData.price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setLoading(true);

      // Upload images if any new ones were selected
      let imageUrls = formData.images || [];
      if (selectedImages.length > 0) {
        const uploadedUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const productData = {
        ...formData,
        images: imageUrls,
      };

      if (editingProduct) {
        await productService.update(editingProduct._id, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await productService.create(productData);
        Alert.alert('Success', 'Product created successfully');
      }
      setDialogVisible(false);
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      gender: typeof product.gender === 'string' ? product.gender : product.gender._id,
      category: typeof product.category === 'string' ? product.category : product.category._id,
      subcategory: typeof product.subcategory === 'string' ? product.subcategory : product.subcategory._id,
      price: product.price,
      discountedPrice: product.discountedPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      images: product.images || [],
      tags: product.tags || [],
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setSelectedImages([]);
    setDialogVisible(true);
  };

  const handleDelete = (product: Product) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
        performDelete(product._id);
      }
    } else {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${product.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => performDelete(product._id), style: 'destructive' },
        ]
      );
    }
  };

  const performDelete = async (id: string) => {
    try {
      setLoading(true);
      await productService.delete(id);
      Alert.alert('Success', 'Product deleted successfully');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      gender: '',
      category: '',
      subcategory: '',
      price: 0,
      stock: 0,
      lowStockThreshold: 10,
      isActive: true,
      isFeatured: false,
      images: [],
      tags: [],
    });
    setSelectedImages([]);
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const getName = (id: string, items: any[]): string => {
    const item = items.find((i) => i._id === id);
    return item?.name || 'Unknown';
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            {item.images && item.images.length > 0 && (
              <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
            )}
            <View style={styles.productDetails}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodyMedium" style={styles.price}>
                ₹{item.price}
                {item.discountedPrice && (
                  <Text style={styles.discountedPrice}> ₹{item.discountedPrice}</Text>
                )}
              </Text>
              <Text variant="bodySmall">Stock: {item.stock}</Text>
              <Text variant="bodySmall">SKU: {item.sku}</Text>
              <View style={styles.badges}>
                {item.isFeatured && <Chip mode="flat" style={styles.featuredChip}>Featured</Chip>}
                <Chip mode="flat">{item.isActive ? 'Active' : 'Inactive'}</Chip>
              </View>
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

  return (
    <View style={styles.container}>
      {loading && products.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text>No products found. Add your first product!</Text>
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
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</Dialog.Title>
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
                  visible={genderMenuVisible}
                  onDismiss={() => setGenderMenuVisible(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setGenderMenuVisible(true)} style={styles.input}>
                      {formData.gender ? getName(formData.gender, genders) : 'Select Gender *'}
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

                <Menu
                  visible={categoryMenuVisible}
                  onDismiss={() => setCategoryMenuVisible(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={styles.input}>
                      {formData.category ? getName(formData.category, categories) : 'Select Category *'}
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

                <Menu
                  visible={subcategoryMenuVisible}
                  onDismiss={() => setSubcategoryMenuVisible(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setSubcategoryMenuVisible(true)} style={styles.input}>
                      {formData.subcategory ? getName(formData.subcategory, subcategories) : 'Select Subcategory *'}
                    </Button>
                  }
                >
                  {subcategories.map((subcategory) => (
                    <Menu.Item
                      key={subcategory._id}
                      onPress={() => {
                        setFormData({ ...formData, subcategory: subcategory._id });
                        setSubcategoryMenuVisible(false);
                      }}
                      title={subcategory.name}
                    />
                  ))}
                </Menu>

                <TextInput
                  label="Price *"
                  value={formData.price.toString()}
                  onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TextInput
                  label="Discounted Price"
                  value={formData.discountedPrice?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, discountedPrice: parseFloat(text) || undefined })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TextInput
                  label="Stock *"
                  value={formData.stock.toString()}
                  onChangeText={(text) => setFormData({ ...formData, stock: parseInt(text) || 0 })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TextInput
                  label="Low Stock Threshold"
                  value={formData.lowStockThreshold?.toString() || '10'}
                  onChangeText={(text) => setFormData({ ...formData, lowStockThreshold: parseInt(text) || 10 })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <View style={styles.imageSection}>
                  <Button mode="outlined" onPress={pickImages} icon="image" style={styles.input}>
                    Select Images
                  </Button>
                  {selectedImages.length > 0 && (
                    <Text variant="bodySmall">{selectedImages.length} image(s) selected</Text>
                  )}
                </View>

                <View style={styles.tagSection}>
                  <TextInput
                    label="Add Tags"
                    value={tagInput}
                    onChangeText={setTagInput}
                    mode="outlined"
                    right={<TextInput.Icon icon="plus" onPress={addTag} />}
                    style={styles.input}
                  />
                  <View style={styles.tagsList}>
                    {formData.tags?.map((tag, index) => (
                      <Chip key={index} onClose={() => removeTag(tag)} style={styles.tag}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Text>Featured</Text>
                  <Switch
                    value={formData.isFeatured}
                    onValueChange={(value) => setFormData({ ...formData, isFeatured: value })}
                  />
                </View>

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
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  price: {
    marginTop: 4,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  discountedPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  featuredChip: {
    backgroundColor: '#ff9800',
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
  imageSection: {
    marginBottom: 12,
  },
  tagSection: {
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
});

export default ProductManagementScreen;
