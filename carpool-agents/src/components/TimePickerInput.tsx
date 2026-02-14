import React, { useState } from 'react';
import { Platform, Pressable, Modal, View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatTime } from '../utils/time';

type TimePickerInputProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  style?: any;
  icon?: string;
};

export function TimePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  style,
  icon,
}: TimePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState<Date | null>(null);

  const displayValue = value ? formatTime(value) : placeholder;

  const handleOpen = () => {
    setTempValue(value ?? new Date());
    setShowPicker(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // Android: picker closes automatically, apply immediately
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS: update temp value for modal
      if (selectedDate) {
        setTempValue(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    if (tempValue) {
      onChange(tempValue);
    }
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setTempValue(null);
  };

  return (
    <>
      <Pressable onPress={handleOpen}>
        <TextInput
          label={label}
          value={displayValue}
          editable={false}
          mode="outlined"
          style={style}
          left={icon ? <TextInput.Icon icon={icon} /> : undefined}
          pointerEvents="none"
        />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Button onPress={handleCancel}>Cancel</Button>
                <Button onPress={handleConfirm}>Done</Button>
              </View>
              <DateTimePicker
                mode="time"
                value={tempValue ?? new Date()}
                display="spinner"
                onChange={handleChange}
                textColor="#F4F7F5"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            mode="time"
            value={tempValue ?? new Date()}
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2F312F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
});
