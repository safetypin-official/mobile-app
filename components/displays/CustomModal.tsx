import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
} from "react-native";
import Button from "@/components/buttons/Button";

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  testID?: string;
  cancelText: string;
  okText: string;
  onOk: () => void;
  onCancel: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  message,
  testID = "custom-modal",
  cancelText,
  okText,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonsRow}>
            <Button
              testID={`${testID}-cancel`}
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
            >
              {cancelText}
            </Button>
            <Button
              testID={`${testID}-ok`}
              onPress={() => {
                onOk();
                onCancel();
              }}
              style={[styles.button, styles.okButton]}
            >
              {okText}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    width: undefined,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  okButton: {
    backgroundColor: "#9f403e",
  },
});

export default CustomModal;
