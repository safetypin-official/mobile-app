import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface DatePickerInputProps {
  label: string;
  initialYear?: number;
  initialMonth?: number;
  initialDay?: number;
  onChange: (year: number, month: number, day: number) => void;
}

const YEARS = Array.from({ length: 31 }, (_, i) => 2020 + i); // 2020 - 2050
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  initialYear,
  initialMonth,
  initialDay,
  onChange,
}) => {
  // Default to earliest values if no initial value is provided
  const [year, setYear] = useState<number>(initialYear ?? 2020);
  const [month, setMonth] = useState<number>(initialMonth ?? 1);
  const [day, setDay] = useState<number>(initialDay ?? 1);

  // Pass initial default values to parent on mount
  useEffect(() => {
    onChange(year, month, day);
  }, []);

  const handleYearChange = (value: number) => {
    const newYear = value || 2020;
    setYear(newYear);
    onChange(newYear, month, day);
  };

  const handleMonthChange = (value: number) => {
    const newMonth = value || 1;
    setMonth(newMonth);
    onChange(year, newMonth, day);
  };

  const handleDayChange = (value: number) => {
    const newDay = value || 1;
    setDay(newDay);
    onChange(year, month, newDay);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.inputLabel}>Month</Text>
          <Picker
            testID="RNPickerSelect"
            style={styles.picker}
            selectedValue={month}
            onValueChange={(value) => handleMonthChange(value)}
          >
            {MONTHS.map((m) => (
              <Picker.Item key={m} label={String(m)} value={m} />
            ))}
          </Picker>
        </View>
        <View style={styles.column}>
          <Text style={styles.inputLabel}>Date</Text>
          <Picker
            testID="RNPickerSelect"
            style={styles.picker}
            selectedValue={day}
            onValueChange={(value) => handleDayChange(value)}
          >
            {DAYS.map((d) => (
              <Picker.Item key={d} label={String(d)} value={d} />
            ))}
          </Picker>
        </View>
        <View style={styles.column}>
          <Text style={styles.inputLabel}>Year</Text>
          <Picker
            testID="RNPickerSelect"
            style={styles.picker}
            selectedValue={year}
            onValueChange={(value) => handleYearChange(value)}
          >
            {YEARS.map((y) => (
              <Picker.Item key={y} label={String(y)} value={y} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#b00",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  picker: {
    width: "100%",
  },
});

export default DatePickerInput;
