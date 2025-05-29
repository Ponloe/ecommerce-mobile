import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search products..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const handleSubmit = () => {
    onSearch(query);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={iconColor} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
});