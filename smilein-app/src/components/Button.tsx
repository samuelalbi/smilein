import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../styles/theme';
import { useAppContext } from '../context/AppContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

const Button = ({ title, variant = 'primary', style, ...props }: ButtonProps) => {
  const { theme } = useAppContext();
  const themeColors = colors[theme];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variant === 'primary' ? themeColors.primary : themeColors.secondary },
        style,
      ]}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
