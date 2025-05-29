import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService, Category, Product } from '@/services/api';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    if (!id) return;
    
    try {
      const [categoryData, productsData] = await Promise.all([
        apiService.getCategory(Number(id)),
        apiService.getProducts({ category_id: Number(id) }),
      ]);
      setCategory(categoryData);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load category data. Please try again.');
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadData();
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100)}
      style={styles.productWrapper}
    >
      <ProductCard product={item} />
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <ThemedText style={styles.loadingText}>Loading category...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: category?.name || 'Category',
          headerBackTitleVisible: false,
        }} 
      />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {category && (
              <ThemedView style={styles.categoryInfo}>
                <ThemedText type="title" style={styles.categoryName}>
                  {category.name}
                </ThemedText>
                {category.description && (
                  <ThemedText style={styles.categoryDescription}>
                    {category.description}
                  </ThemedText>
                )}
                <ThemedText style={styles.productCount}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </ThemedText>
              </ThemedView>
            )}
            
            <SearchBar 
              onSearch={handleSearch}
              placeholder={`Search in ${category?.name || 'category'}...`}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? 'No products found' : 'No products in this category'}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Check back later for new products'
              }
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryInfo: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 0,
  },
  categoryName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  categoryDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 12,
  },
  productCount: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  productWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: (width - 56) / 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});