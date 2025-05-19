import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
  label: string;
  initialYear?: number;
  initialMonth?: number;
  initialDay?: number;
  onChange: (year: number, month: number, day: number) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  initialYear,
  initialMonth,
  initialDay,
  onChange,
}) => {
  // Create a Date object from the initial values
  const createDateFromProps = () => {
    const newDate = new Date();
    if (initialYear) newDate.setFullYear(initialYear);
    if (initialMonth) newDate.setMonth(initialMonth - 1); // Convert from 1-indexed to 0-indexed
    if (initialDay) newDate.setDate(initialDay);
    return newDate;
  };
  
  const [date, setDate] = useState<Date>(createDateFromProps());
  const [showPicker, setShowPicker] = useState(false);

  // This effect updates the internal date when props change (like during reset)
  useEffect(() => {
    const newDate = createDateFromProps();
    setDate(newDate);
  }, [initialYear, initialMonth, initialDay]);

  // Format date for display: "Jan 15, 2023"
  const formatDisplayDate = (date: Date) => {
    const monthName = MONTH_NAMES[date.getMonth()].slice(0, 3);
    return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    
    if (selectedDate) {
      setDate(selectedDate);
      
      // Pass the date components back to the parent
      onChange(
        selectedDate.getFullYear(),     // year
        selectedDate.getMonth() + 1,    // month (convert from 0-indexed to 1-indexed)
        selectedDate.getDate()          // day
      );
    }
  };

  const showDatepicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.dateDisplay}
        onPress={showDatepicker}
        testID={`date-picker-${label}`}
      >
        <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
        <View style={styles.calendarIcon}>
          <Text style={styles.calendarIconText}>📅</Text>
        </View>
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#b00",
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  calendarIcon: {
    padding: 2,
  },
  calendarIconText: {
    fontSize: 18,
  },
});

export default DatePickerInput;