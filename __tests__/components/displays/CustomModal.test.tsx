// __tests__/CustomModal.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal } from 'react-native';
import CustomModal from '@/components/displays/CustomModal';

describe('CustomModal', () => {
  const baseProps = {
    title: 'Test Title',
    message: 'Test Message',
    cancelText: 'Cancel',
    okText: 'OK',
  };

  it('renders title, message, and default testIDs when visible=true', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const { getByText, getByTestId } = render(
      <CustomModal
        visible={true}
        testID='custom-modal'
        {...baseProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    // content
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();

    // default testID on Modal
    const modal = getByTestId('custom-modal');
    expect(modal.props.visible).toBe(true);

    // buttons
    expect(getByTestId('custom-modal-cancel')).toBeTruthy();
    expect(getByTestId('custom-modal-ok')).toBeTruthy();
  });

  it('does not render when visible=false', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const { queryByTestId } = render(
      <CustomModal
        visible={false}
        {...baseProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    expect(queryByTestId('custom-modal')).toBeNull();
  });

  it('accepts a custom testID and applies it to buttons', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <CustomModal
        visible={true}
        testID="my-modal"
        {...baseProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    expect(getByTestId('my-modal')).toBeTruthy();
    expect(getByTestId('my-modal-cancel')).toBeTruthy();
    expect(getByTestId('my-modal-ok')).toBeTruthy();
  });

  it('calls only onCancel when the cancel button is pressed', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <CustomModal
        visible={true}
        {...baseProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    fireEvent.press(getByTestId('custom-modal-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
  });

  it('calls onOk then onCancel when the ok button is pressed', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <CustomModal
        visible={true}
        {...baseProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    fireEvent.press(getByTestId('custom-modal-ok'));
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('invokes onCancel via Modal.onRequestClose', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const { UNSAFE_getByType } = render(
      <CustomModal
        visible={true}
        {...baseProps}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    const modalInstance = UNSAFE_getByType(Modal);
    // simulate hardware back button or outside tap
    modalInstance.props.onRequestClose();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
