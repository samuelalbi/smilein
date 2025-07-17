import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FormFieldProps {
  label: string;
  value: string;
  icon: string;
  editable?: boolean;
  onChange?: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  icon,
  editable = true,
  onChange,
  keyboardType = 'default',
  secureTextEntry = false,
  placeholder = '',
}) => {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color="#1E2A40" />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            !editable && styles.readOnlyInput,
          ]}
          value={value}
          onChangeText={onChange}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  readOnlyInput: {
    color: '#666',
    opacity: 0.8,
  },
});

export default FormField;
