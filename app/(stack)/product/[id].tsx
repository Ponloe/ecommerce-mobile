import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService, Product } from '@/services/api';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      const productData = await apiService.getProduct(Number(id));
      setProduct(productData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product details. Please try again.');
      console.error('Error loading product:', error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleQuantityChange = (increment: boolean) => {
    if (increment && quantity < (product?.stock || 0)) {
      setQuantity(quantity + 1);
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    Alert.alert(
      'Added to Cart',
      `${quantity} x ${product?.name} added to cart!`,
      [{ text: 'OK' }]
    );
  };

  const handleBuyNow = () => {
    // TODO: Implement checkout functionality
    Alert.alert(
      'Buy Now',
      `Proceeding to checkout with ${quantity} x ${product?.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/(stack)/checkout') }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <ThemedText style={styles.loadingText}>Loading product...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Product Not Found' }} />
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Product not found</ThemedText>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const imageUri = product.image 
    ? `http://192.168.0.202:8000/storage/${product.image}`
    : 'https://via.placeholder.com/400x400?text=No+Image';

  const price = product.price ? Number(product.price).toFixed(2) : '0.00';
  const isOutOfStock = product.stock === 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: product.name,
          headerBackTitleVisible: false,
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200)}>
          <Image
            source={{ uri: imageUri }}
            style={styles.productImage}
            contentFit="cover"
            placeholder="Loading..."
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.content}>
          <ThemedView style={styles.productInfo}>
            <ThemedText type="title" style={styles.productName}>
              {product.name}
            </ThemedText>
            
            <View style={styles.priceStock}>
              <ThemedText style={styles.price}>${price}</ThemedText>
              <ThemedText style={[
                styles.stock,
                isOutOfStock && styles.outOfStock
              ]}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </ThemedText>
            </View>

            {product.category && (
              <TouchableOpacity 
                style={styles.categoryChip}
                onPress={() => router.push(`/(stack)/category/${product.category?.id}`)}
              >
                <ThemedText style={styles.categoryText}>
                  {product.category.name}
                </ThemedText>
              </TouchableOpacity>
            )}

            <ThemedText style={styles.description}>
              {product.description || 'No description available.'}
            </ThemedText>
          </ThemedView>

          {!isOutOfStock && (
            <ThemedView style={styles.quantitySection}>
              <ThemedText style={styles.quantityLabel}>Quantity</ThemedText>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(false)}
                  disabled={quantity <= 1}
                >
                  <ThemedText style={styles.quantityButtonText}>-</ThemedText>
                </TouchableOpacity>
                
                <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(true)}
                  disabled={quantity >= product.stock}
                >
                  <ThemedText style={styles.quantityButtonText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}
        </Animated.View>
      </ScrollView>

      {!isOutOfStock && (
        <Animated.View entering={FadeInUp.delay(400)} style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <ThemedText style={styles.buyNowText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}
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
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: width,
    height: width,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 20,
  },
  productInfo: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  priceStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  stock: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
  outOfStock: {
    color: '#dc2626',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e293b',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  addToCartText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});