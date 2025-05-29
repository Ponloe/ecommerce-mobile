import { CategoryChip } from '@/components/CategoryChip';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { apiService, Category, Product } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories([{ id: 0, name: 'All', description: 'All products' }, ...categoriesData]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data. Please try again.');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryPress = async (category: Category) => {
    setSelectedCategory(category.id === 0 ? null : category);
    setLoading(true);
    
    try {
      const filters = category.id === 0 ? {} : { category_id: category.id };
      const productsData = await apiService.getProducts(filters);
      setProducts(productsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter products.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const productsData = await apiService.getProducts({ search: query });
      setProducts(productsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to search products.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedCategory(null);
    setSearchQuery('');
    loadData();
  };

  const renderCategory = ({ item, index }: { item: Category; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <CategoryChip
        category={item}
        isSelected={selectedCategory?.id === item.id || (item.id === 0 && !selectedCategory)}
        onPress={handleCategoryPress}
      />
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <Animated.View entering={FadeInDown.delay(200)} style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>E-Shop</ThemedText>
          <ThemedText style={styles.subtitle}>Discover amazing products</ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{products.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Products</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{categories.length - 1}</ThemedText>
              <ThemedText style={styles.statLabel}>Categories</ThemedText>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View entering={FadeInDown.delay(300)}>
          <SearchBar onSearch={handleSearch} />
        </Animated.View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Products Section Header */}
      <View style={styles.productsSectionHeader}>
        <ThemedText style={styles.sectionTitle}>
          {selectedCategory ? selectedCategory.name : searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
        </ThemedText>
        <ThemedText style={styles.productCount}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </ThemedText>
      </View>
    </View>
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const isLeft = index % 2 === 0;
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)}
        style={[styles.productWrapper, { marginRight: isLeft ? 8 : 0, marginLeft: isLeft ? 0 : 8 }]}
      >
        <ProductCard product={item} />
      </Animated.View>
    );
  };

  if (loading && !refreshing && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.flatListContainer, { justifyContent: 'center' }]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyTitle}>No products found</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Try adjusting your search or category filter
              </ThemedText>
            </View>
          )
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
  flatListContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-evenly', 
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1e293b',
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  productCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  productWrapper: {
    width: (width - 64) / 2, // Adjusted for better spacing
    maxWidth: 170, // Slightly smaller max width
    alignSelf: 'center', // Added to center each wrapper
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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