import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Product } from '@/services/api';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const handlePress = () => {
      router.push(`/(stack)/product/${product.id}`);
    };
  

  const price = product.price ? Number(product.price).toFixed(2) : '0.00';
  const stock = product.stock || 0;
  const imageUri = product.image 
    ? `http://192.168.0.202:8000/storage/${product.image}`
    : 'https://via.placeholder.com/200x200?text=No+Image';
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.card}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          placeholder="Loading..."
        />
        <ThemedView style={styles.content}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.name}>
            {product.name || 'Unnamed Product'}
          </ThemedText>
          <ThemedText style={styles.price}>
            ${price}
          </ThemedText>
          <ThemedText style={styles.stock}>
            Stock: {stock}
          </ThemedText>
          {product.category && (
            <ThemedText style={styles.category}>
              {product.category.name}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center', 
    },
    card: {
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      width: '100%',
      maxWidth: 170, // Consistent width
    },
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      padding: 16,
      alignItems: 'center',
    },
    name: {
      marginBottom: 8,
      textAlign: 'center',
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#0a7ea4',
      textAlign: 'center',
    },
    stock: {
      fontSize: 12,
      opacity: 0.7,
      marginBottom: 4,
      textAlign: 'center',
    },
    category: {
      fontSize: 12,
      opacity: 0.8,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });