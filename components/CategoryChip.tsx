import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Category } from '@/services/api';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onPress: (category: Category) => void;
}

export function CategoryChip({ category, isSelected, onPress }: CategoryChipProps) {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = isSelected ? tintColor : 'transparent';
  const textColor = isSelected ? '#fff' : tintColor;
  const borderColor = tintColor;

  return (
    <TouchableOpacity onPress={() => onPress(category)}>
      <ThemedView style={[styles.chip, { backgroundColor, borderColor }]}>
        <ThemedText style={[styles.text, { color: textColor }]}>
          {category.name}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});