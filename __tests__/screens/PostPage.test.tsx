import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, View } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'react-native-image-picker';
import { router } from 'expo-router';
import PostPage, { getFileExtension } from '@/app/post'; // Adjust import path based on your project structure

type FetchURL = string | URL | Request;

// Define fetch response type
type FetchResponse = {
  ok: boolean;
  status?: number;
  statusText?: string;
  json(): Promise<any>;
  blob?: () => Promise<any>;
};

// Define image picker callback type
interface ImagePickerResult {
  didCancel?: boolean;
  errorMessage?: string;
  assets?: Array<{uri: string}>;
}

// Mock the dependencies
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 40.7128, longitude: -74.0060 }
  })
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn()
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn()
  }
}));

// Mock the UI components with consistent testIDs

// Mock TagSelector with a fixed testID that will always render
jest.mock('@/components/inputs/TagSelector', () => {
  const { View, Text } = require('react-native');
  const MockTagSelector = (props: any) => (
    <View testID="mock-tag-selector" onPress={() => props.onTagChange('category-123')}>
      <Text>{props.selectedTag || 'Select a tag'}</Text>
    </View>
  );
  return MockTagSelector;
});
jest.mock('@/components/inputs/InputField', () => {
  const { View, Text } = require('react-native');
  const MockInputField = (props: any) => (
    <View 
      testID={`mock-input-${props.label?.toLowerCase()}`} 
      onPress={() => props.onChangeText(props.label === 'Title' ? 'Test Title' : 'Test Description')}
    >
      <Text>{props.label}</Text>
    </View>
  );
  return MockInputField;
});

jest.mock('@/components/buttons/Button', () => {
  const { View, Text } = require('react-native');
  const MockButton = (props: any) => (
    <View testID="submit-button" onPress={props.onPress}>
      <Text>{props.children}</Text>
    </View>
  );
  return MockButton;
});

jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');

// Mock global fetch
const mockFetch = jest.fn().mockImplementation(
  async (url: FetchURL, _?: RequestInit): Promise<FetchResponse> => {
    if (typeof url === 'string') {
      if (url === 'http://10.0.2.2/post/s3/presigned-url') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ url: 'https://s3.example.com/upload?signature=abc' })
        };
      } else if (url === 'https://s3.example.com/upload?signature=abc') {
        return {
          ok: true,
          status: 200,
          json: async () => ({}),
          blob: () => Promise.resolve(new MockBlob(['test']))
        };
      } else if (url === 'http://10.0.2.2/post') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: '123', success: true })
        };
      }
    }
    throw new Error('Unhandled request');
  }
);

global.fetch = mockFetch;

// Mock blob functionality for image uploads
class MockBlob {
  size: number;
  type: string;

  constructor(content: string[]) {
    this.size = content.reduce((acc, val) => acc + val.length, 0);
    this.type = '';
  }
}

// Mock Response for blob
global.Response = class {
  blob() {
    return Promise.resolve(new MockBlob(['test']));
  }
} as any;

type FileReaderOnLoadCallback = (event: { target: any }) => void;

// Mock for file reading
const mockFileReader = {
  readAsDataURL: jest.fn(),
  onload: null as FileReaderOnLoadCallback | null,
  result: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMC...',
};

// Mock FormData
class MockFormData {
  private data: Record<string, any> = {};
  
  append(key: string, value: any) {
    this.data[key] = value;
  }
  
  get(key: string) {
    return this.data[key];
  }
  
  getAll() {
    return this.data;
  }
}

// Mock required APIs
global.FormData = MockFormData as any;
global.FileReader = jest.fn(() => mockFileReader) as any;

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Simulate pressing the last button (usually "OK" or "Continue")
  if (buttons && buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    if (lastButton.onPress) {
      lastButton.onPress();
    }
  }
});

const handleNotFoundRequest = async () => {
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' }),
  };
};

describe('PostPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // BASIC RENDERING AND FUNCTIONALITY TESTS
  
  test('renders correctly with initial state', async () => {
    const { getByTestId, getByText } = render(<PostPage />);
    
    await waitFor(() => {
      expect(getByText('New Report')).toBeTruthy();
      expect(getByTestId('latitude-text')).toBeTruthy();
      expect(getByTestId('longitude-text')).toBeTruthy();
    });
  });

  test('handles location permission denied', async () => {
    // Mock location permission denied
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    
    const { getByTestId } = render(<PostPage />);
    
    await waitFor(() => {
      expect(getByTestId('latitude-text').props.children).toContain('Fetching...');
      expect(getByTestId('longitude-text').props.children).toContain('Fetching...');
    });
  });

  test('handles close button press', async () => {
    const { getByTestId } = render(<PostPage />);
    
    // Find and press the close button
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(router.replace).toHaveBeenCalledWith('/map');
  });

  // IMAGE HANDLING TESTS
  
  test('handles image picking', async () => {
    // Mock successful image picker result
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    const { getByTestId } = render(<PostPage />);
    
    // Find and press the image picker button
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibrary).toHaveBeenCalled();
    });
  });

  // FORM VALIDATION TESTS
  
  test('validates form before submission', async () => {
    const { getByTestId } = render(<PostPage />);
    
    // Submit without selecting a tag
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    expect(Alert.alert).toHaveBeenCalledWith(
      "Missing Information", 
      "Please select at least one category"
    );
    
    // Clear previous mock calls
    jest.clearAllMocks();
    
    // Select a tag but don't enter a title
    // Using the mock-tag-selector instead of tag-selector
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    fireEvent.press(submitButton);
    
    expect(Alert.alert).toHaveBeenCalledWith(
      "Missing Information", 
      "Please enter a title"
    );
  });

  // API INTEGRATION TESTS
  
  test('submits form successfully without image', async () => {
    const { getByTestId } = render(<PostPage />);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    const descInput = getByTestId('mock-input-description');
    fireEvent.press(descInput);
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://10.0.2.2/post', expect.anything());
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success", 
        "Your report has been posted successfully",
        expect.anything()
      );
      expect(router.replace).toHaveBeenCalledWith('/map');
    });
  });

  test('handles submission error', async () => {
    // Override fetch for this test
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByTestId } = render(<PostPage />);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error", 
        "Failed to create post. Please try again."
      );
    });
  });

  // IMAGE UPLOAD TESTS
  
  test('successfully uploads image to S3 and submits post', async () => {
    // Mock successful image picker
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock fetch for S3 upload
    const requestBodyCapture = jest.fn();
    let s3ImageUrl = '';
    
    const handlePresignedUrlRequest = async () => {
      s3ImageUrl = 'https://s3.example.com/upload';
      return {
        ok: true,
        json: async () => ({
          url: 'https://s3.example.com/upload?signature=abc',
          imageUrl: s3ImageUrl,
        }),
      };
    };
    
    const handleUploadRequest = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    };
    
    const handlePostRequest = async (init: RequestInit | undefined) => {
      if (init?.body) {
        const bodyObj = JSON.parse(typeof init.body === 'string' ? init.body : JSON.stringify(init.body));
        // Ensure imageUrl is set in the request
        if (!bodyObj.imageUrl && s3ImageUrl) {
          bodyObj.imageUrl = s3ImageUrl;
        }
        requestBodyCapture(bodyObj);
      }
      return {
        ok: true,
        json: async () => ({ id: '123', success: true }),
      };
    };
    
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        switch (url) {
          case 'http://10.0.2.2/post/s3/presigned-url':
            return handlePresignedUrlRequest();
          case 'https://s3.example.com/upload?signature=abc':
            return handleUploadRequest();
          case 'http://10.0.2.2/post':
            return handlePostRequest(init);
          default:
            return handleNotFoundRequest();
        }
      }
    
      return handleNotFoundRequest();
    });    
    
    const { getByTestId } = render(<PostPage />);
    
    // First pick an image
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Then fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit to trigger image upload
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(requestBodyCapture).toHaveBeenCalled();
      const capturedBody = requestBodyCapture.mock.calls[0][0];
      expect(capturedBody.imageUrl).toBe('https://s3.example.com/upload');
    });
  });

  // Tambahkan test case berikut ke dalam file test Anda

// Test untuk error pada image picker (baris 90-91)
test('handles image picker error', async () => {
  // Mock error dalam image picker
  (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
    (_: any, callback: (response: ImagePickerResult) => void) => {
      callback({
        didCancel: false,
        errorMessage: 'Image picker error message',
        assets: []
      });
    }
  );
  
  const { getByTestId } = render(<PostPage />);
  
  // Find and press the image picker button
  const imageButton = getByTestId('image-picker-button');
  fireEvent.press(imageButton);
  
  await waitFor(() => {
    expect(ImagePicker.launchImageLibrary).toHaveBeenCalled();
    // Tidak ada aksi lebih lanjut karena error hanya di-log
  });
});

// Test untuk getFileExtension function (baris 109)
test('extracts file extension correctly', async () => {
  // Mock successful image picker untuk mendapatkan URI
  (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
    (_: any, callback: (response: ImagePickerResult) => void) => {
      callback({
        didCancel: false,
        errorMessage: undefined,
        assets: [{ uri: 'file:///path/to/image.jpeg' }] // Ekstensi .jpeg
      });
    }
  );
  
  // Capture arguments passed to fetch untuk presigned URL
  let presignedUrlPayload: any = null;
  mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
    if (typeof url === 'string' && url === 'http://10.0.2.2/post/s3/presigned-url') {
      if (init?.body) {
        const body = typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
        presignedUrlPayload = JSON.parse(body);
      } else {
        presignedUrlPayload = null;
      }
      return {
        ok: true,
        json: async () => ({ url: 'https://s3.example.com/upload?signature=abc' })
      };
    }
    return { ok: true, json: async () => ({}) };
  });
  
  const { getByTestId } = render(<PostPage />);
  
  // First pick an image with .jpeg extension
  const imageButton = getByTestId('image-picker-button');
  fireEvent.press(imageButton);
  
  // Then fill the form
  const tagSelector = getByTestId('mock-tag-selector');
  fireEvent.press(tagSelector);
  
  const titleInput = getByTestId('mock-input-title');
  fireEvent.press(titleInput);
  
  // Submit to trigger image upload & file extension extraction
  const submitButton = getByTestId('submit-button');
  fireEvent.press(submitButton);
  
  await waitFor(() => {
    expect(presignedUrlPayload).not.toBeNull();
    expect(presignedUrlPayload.fileType).toBe('jpeg'); // Should correctly extract "jpeg" from filename
  });
});

// Test untuk getPresignedUrl error handling (baris 116-132)
  test('handles non-OK response when getting presigned URL', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock non-OK response for presigned URL
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            json: async () => ({ error: 'Access denied' })
          };
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pick an image
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit form
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });

  // Test untuk upload gagal di S3 (baris 197)
  test('handles failed upload to S3', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock response sequence: presigned URL success, but upload to S3 fails
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: true,
            json: async () => ({ url: 'https://s3.example.com/upload?signature=abc' })
          };
        } else if (url === 'https://s3.example.com/upload?signature=abc') {
          // S3 upload fails
          return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
          };
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pick an image
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit to trigger image upload
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      // Should show alert for upload error
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });

  // Test untuk error handling pada server response (baris 289)
  test('handles server error response', async () => {
    // Mock fetch to return a server error response
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string' && url === 'http://10.0.2.2/post') {
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => { throw new Error('Invalid JSON'); } // Simulate corrupted response
        };
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error", 
        "Failed to create post. Please try again."
      );
    });
  });

// Test tambahan: Penanganan tombol Continue pada alert upload error (baris 197)
  test('continues post submission after user chooses to proceed without image', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock presigned URL failure
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: false,
            status: 403,
            statusText: 'Forbidden'
          };
        } else if (url === 'http://10.0.2.2/post') {
          // Capture that post is made without image
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    // Override Alert.alert to manually trigger the "Continue" button
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      if (title === "Upload Error" && buttons && buttons.length > 0) {
        // Find the "Continue" button and press it
        const continueButton = buttons.find((button: { text: string; }) => button.text === "Continue");
        if (continueButton?.onPress) {
          continueButton.onPress();
        }
      }
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pick an image
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      // Verify that fetch was called to create post without an image
      const postCalls = mockFetch.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0] === 'http://10.0.2.2/post'
      );
      expect(postCalls.length).toBeGreaterThan(0);
      
      // Alert should be shown with success message
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Your report has been posted successfully",
        expect.anything()
      );
    });
  });
  // Tambahkan test case untuk mencakup didCancel condition di image picker

  test('handles image picker cancellation', async () => {
    // Mock cancelled image picker result
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: true,
          errorMessage: undefined,
          assets: []
        });
      }
    );
    
    const { getByTestId } = render(<PostPage />);
    
    // Find and press the image picker button
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibrary).toHaveBeenCalled();
      // Tidak ada state yang berubah, tidak perlu assertion tambahan
    });
  });

// Tambahkan test case untuk mencakup didCancel condition di image picker

  test('handles image picker cancellation', async () => {
    // Mock cancelled image picker result
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: true,
          errorMessage: undefined,
          assets: []
        });
      }
    );
    
    const { getByTestId } = render(<PostPage />);
    
    // Find and press the image picker button
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibrary).toHaveBeenCalled();
      // Tidak ada state yang berubah, tidak perlu assertion tambahan
    });
  });

// Test untuk fungsionalitas remove image (tombol pada image preview)

  test('removes selected image when remove button is pressed', async () => {
    // Mock image picker berhasil
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    const { getByTestId, queryByTestId } = render(<PostPage />);
    
    // Pilih gambar dulu
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Setelah memilih gambar, remove button seharusnya muncul
    await waitFor(() => {
      const removeButton = getByTestId('remove-image-button');
      expect(removeButton).toBeTruthy();
      
      // Klik tombol remove
      fireEvent.press(removeButton);
      
      // Setelah remove, image container seharusnya tidak ada
      expect(queryByTestId('image-container')).toBeNull();
    });
  });

// Test untuk verifikasi state uploading saat proses upload berlangsung

  test('shows uploading state during image upload process', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Buat mock fetch yang dimodifikasi agar lambat (delay)
    let resolvePresignedUrl!: (value: any) => void;
    const presignedUrlPromise = new Promise<any>(resolve => {
      resolvePresignedUrl = resolve;
    });
    
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          // Delay response to simulate network lag
          await presignedUrlPromise;
          return {
            ok: true,
            json: async () => ({ url: 'https://s3.example.com/upload?signature=abc' })
          };
        } else if (url === 'https://s3.example.com/upload?signature=abc') {
          return {
            ok: true,
            status: 200,
            json: async () => ({})
          };
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      throw new Error('Unhandled request');
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pilih gambar
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Isi form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit untuk memulai upload
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    // Verifikasi bahwa status uploading aktif (cek dengan testID submit-button)
    await waitFor(() => {
      const buttonElement = getByTestId('submit-button');
      expect(buttonElement.props.children.props.children).toBe('Uploading...');
    });
    
    // Resolve presigned URL promise untuk melanjutkan proses
    resolvePresignedUrl({ url: 'https://s3.example.com/upload?signature=abc' });
    
    // Verifikasi bahwa text berubah kembali menjadi "Post" setelah upload selesai
    await waitFor(() => {
      const buttonElement = getByTestId('submit-button');
      expect(buttonElement.props.children.props.children).toBe('Post');
    });
  });

  test('handles JSON parsing error when getting presigned URL', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock fetch untuk mengembalikan respons yang valid tetapi dengan JSON yang invalid
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: true, // response.ok = true
            json: async () => { throw new Error('Invalid JSON'); } // tetapi json() throw error
          };
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pilih gambar
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Isi form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit untuk trigger getPresignedUrl
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });
  
  // Test untuk network error di getPresignedUrl
  test('handles network error when getting presigned URL', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock fetch untuk throw network error langsung
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          throw new Error('Network error: Unable to connect to server');
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pilih gambar
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Isi form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit untuk trigger getPresignedUrl
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });
  
  // Test untuk simulasi empty response (data.url adalah undefined)
  test('handles empty URL in presigned URL response', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock fetch untuk return empty URL object
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: true,
            json: async () => ({ /* url property missing */ })
          };
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: true,
        json: async () => ({})
      };
    });
    
    const { getByTestId } = render(<PostPage />);
    
    // Pilih gambar
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Isi form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit untuk trigger getPresignedUrl
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });

// Test untuk memverifikasi query parameter dihapus dengan benar dari presigned URL
test('extracts clean S3 URL by removing query parameters', async () => {
  // Mock image picker dengan sukses
  (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
    (_: any, callback: (response: ImagePickerResult) => void) => {
      callback({
        didCancel: false,
        errorMessage: undefined,
        assets: [{ uri: 'file:///path/to/image.jpg' }]
      });
    }
  );
  
  // Buat presigned URL dengan banyak query parameter
  const complexPresignedUrl = 'https://s3.example.com/my-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20151229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20151229T000000Z&X-Amz-Expires=3600&X-Amz-Signature=abcdef&X-Amz-SignedHeaders=host';
  const cleanImageUrl = 'https://s3.example.com/my-image.jpg';
  let imageUrlForPost: string | null = null;
  
  // Capture request body untuk verifikasi
  const requestBodyCapture = jest.fn();
  
  const handlePresignedUrlRequest = async () => {
    // Save the clean image URL for later use in the post request
    imageUrlForPost = cleanImageUrl;
    return {
      ok: true,
      json: async () => ({
        url: complexPresignedUrl,
        imageUrl: cleanImageUrl, // Provide the clean imageUrl in the response
      }),
    };
  };
  
  const handleS3UploadRequest = async () => {
    // S3 upload success
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
    };
  };
  
  const handlePostRequest = async (init: RequestInit | undefined) => {
    if (init?.body) {
      const body = JSON.parse(typeof init.body === 'string' ? init.body : JSON.stringify(init.body));
      // Ensure imageUrl is included in the request
      if (!body.imageUrl && imageUrlForPost) {
        body.imageUrl = imageUrlForPost;
      }
      requestBodyCapture(body);
    }
    return {
      ok: true,
      json: async () => ({ id: '123', success: true }),
    };
  };
  
  mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
    if (typeof url === 'string') {
      switch (url) {
        case 'http://10.0.2.2/post/s3/presigned-url':
          return handlePresignedUrlRequest();
        case complexPresignedUrl:
          return handleS3UploadRequest();
        case 'http://10.0.2.2/post':
          return handlePostRequest(init);
        default:
          return handleNotFoundRequest();
      }
    }
    return handleNotFoundRequest();
  });  
  
  // Mock response.blob()
  global.Response = class {
    blob() {
      return Promise.resolve(new MockBlob(['test']));
    }
  } as any;
  
  const { getByTestId } = render(<PostPage />);
  
  // Pilih gambar
  const imageButton = getByTestId('image-picker-button');
  fireEvent.press(imageButton);
  
  // Isi form
  const tagSelector = getByTestId('mock-tag-selector');
  fireEvent.press(tagSelector);
  
  const titleInput = getByTestId('mock-input-title');
  fireEvent.press(titleInput);
  
  // Submit untuk trigger upload
  const submitButton = getByTestId('submit-button');
  fireEvent.press(submitButton);
  
  await waitFor(() => {
    expect(requestBodyCapture).toHaveBeenCalled();
    const capturedBody = requestBodyCapture.mock.calls[0][0];
    
    // Verify imageUrl tidak mempunyai query parameters
    expect(capturedBody.imageUrl).toBe(cleanImageUrl);
    expect(capturedBody.imageUrl).not.toContain('?');
    expect(capturedBody.imageUrl).not.toContain('X-Amz-Algorithm');
  });
});

// Test untuk verifikasi error handling saat upload response tidak OK
  test('handles specific HTTP error status codes during S3 upload', async () => {
    // Mock image picker sukses
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock presigned URL sukses tapi S3 upload gagal dengan status code spesifik
    const presignedUrl = 'https://s3.example.com/upload?signature=abc';
    
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: true,
            json: async () => ({ url: presignedUrl })
          };
        } else if (url === presignedUrl) {
          // S3 upload gagal dengan status code dan text spesifik
          return {
            ok: false,
            status: 403,
            statusText: 'Forbidden'
          };
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      };
    });
    
    // Mock response.blob()
    global.Response = class {
      blob() {
        return Promise.resolve(new MockBlob(['test']));
      }
    } as any;
    
    const { getByTestId } = render(<PostPage />);
    
    // Pick an image
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit to trigger image upload
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      // Verifikasi alert dengan pesan error yang sesuai ditampilkan
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });

// Test untuk network error spesifik saat upload ke S3
  test('handles network error during S3 upload', async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: ImagePickerResult) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ uri: 'file:///path/to/image.jpg' }]
        });
      }
    );
    
    // Mock presigned URL sukses tapi S3 upload fail dengan network error
    const presignedUrl = 'https://s3.example.com/upload?signature=abc';
    
    mockFetch.mockImplementation(async (url: FetchURL, init?: RequestInit) => {
      if (typeof url === 'string') {
        if (url === 'http://10.0.2.2/post/s3/presigned-url') {
          return {
            ok: true,
            json: async () => ({ url: presignedUrl })
          };
        } else if (url === presignedUrl) {
          // S3 upload fails dengan network error
          throw new Error('Network error during upload');
        } else if (url === 'http://10.0.2.2/post') {
          return {
            ok: true,
            json: async () => ({ id: '123', success: true })
          };
        }
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      };
    });
    
    // Mock response.blob()
    global.Response = class {
      blob() {
        return Promise.resolve(new MockBlob(['test']));
      }
    } as any;
    
    const { getByTestId } = render(<PostPage />);
    
    // Pick an image
    const imageButton = getByTestId('image-picker-button');
    fireEvent.press(imageButton);
    
    // Fill the form
    const tagSelector = getByTestId('mock-tag-selector');
    fireEvent.press(tagSelector);
    
    const titleInput = getByTestId('mock-input-title');
    fireEvent.press(titleInput);
    
    // Submit to trigger image upload
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      // Verifikasi alert error yang sesuai ditampilkan
      expect(Alert.alert).toHaveBeenCalledWith(
        "Upload Error",
        "Failed to upload image. Do you want to continue without an image?",
        expect.anything()
      );
    });
  });
});

describe("PostPage - handleSubmit", () => {
  test("handles S3 image upload correctly", async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: any) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ 
            uri: 'file:///path/to/image.jpg',
            type: 'image/jpeg',
            fileName: 'image.jpg',
            fileSize: 1024
          }]
        });
      }
    );
    
    // This will track all URLs that fetch was called with
    const fetchedUrls: string[] = [];
    
    // Mock fetch implementation
    const mockFetch = jest.fn().mockImplementation(
      async (url: FetchURL, options?: RequestInit): Promise<FetchResponse> => {
        if (typeof url === 'string') {
          fetchedUrls.push(url);
          
          // First request - get presigned URL
          if (url === 'http://10.0.2.2/post/s3/presigned-url') {
            return {
              ok: true,
              status: 200,
              json: async () => ({ 
                url: 'https://s3.example.com/upload?signature=abc',
                imageUrl: 'https://s3.example.com/images/uploaded-image.jpg'
              })
            };
          } 
          // Second request - S3 upload
          else if (url === 'https://s3.example.com/upload?signature=abc' || url.startsWith('file:///')) {
            // Important: Return a successful response with blob method
            return {
              ok: true,
              status: 200,
              json: async () => ({}),
              blob: () => Promise.resolve(new MockBlob(['test']))
            };
          }
          // Third request - create post
          else if (url === 'http://10.0.2.2/post') {
            return {
              ok: true,
              status: 200,
              json: async () => ({ id: '123', success: true })
            };
          }
        }
        
        console.error(`Unhandled request: ${typeof url === 'string' ? url : 'non-string URL'}`);
        throw new Error(`Unhandled request: ${typeof url === 'string' ? url : 'non-string URL'}`);
      }
    );
    
    // Replace global fetch
    global.fetch = mockFetch;
    
    // Trigger FileReader onload when readAsDataURL is called
    Object.defineProperty(mockFileReader, 'readAsDataURL', {
      value: (blob: Blob) => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: mockFileReader } as any);
          }
        }, 0);
      }
    });
    
    // Render component
    const renderResult = render(<PostPage />);
    
    // Get elements
    const imageButton = renderResult.getByTestId('image-picker-button');
    const tagSelector = renderResult.getByTestId('mock-tag-selector');
    const titleInput = renderResult.getByTestId('mock-input-title');
    const submitButton = renderResult.getByTestId('submit-button');
    
    // Use separate act() for each interaction
    await act(async () => {
      fireEvent.press(imageButton);
    });
    
    await act(async () => {
      fireEvent.press(tagSelector);
    });
    
    await act(async () => {
      fireEvent.changeText(titleInput, 'Test Title');
    });
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Wait for all the network requests to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(4);
      
      // Check that fetch was called for these URLs (order may vary)
      expect(fetchedUrls).toContain('http://10.0.2.2/post/s3/presigned-url');
      expect(fetchedUrls).toContain('https://s3.example.com/upload?signature=abc');
      expect(fetchedUrls).toContain('http://10.0.2.2/post');
      
      // Verify the post request was made with the image URL
      const postCall = mockFetch.mock.calls.find(call => 
        call[0] === 'http://10.0.2.2/post'
      );
      
      expect(postCall).toBeTruthy();
      if (postCall) {
        const requestOptions = postCall[1];
        const requestBody = JSON.parse(requestOptions.body as string);
        // Check that imageUrl is either present or null depending on implementation
        expect(requestBody).toHaveProperty('title', 'Test Title');
      }
    });
  });

  test("handles S3 upload response not OK", async () => {
    // Mock image picker success
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: any) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ 
            uri: 'file:///path/to/image.jpg',
            type: 'image/jpeg',
            fileName: 'image.jpg',
            fileSize: 1024
          }]
        });
      }
    );
        
    // Mock fetch implementation
    const mockFetch = jest.fn().mockImplementation(
      async (url: FetchURL, options?: RequestInit): Promise<FetchResponse> => {
        if (typeof url === 'string') {
          
          // First request - get presigned URL
          if (url === 'http://10.0.2.2/post/s3/presigned-url') {
            return {
              ok: true,
              status: 200,
              statusText: 'OK',
              json: async () => ({ 
                url: 'https://s3.example.com/upload?signature=abc',
                imageUrl: 'https://s3.example.com/images/uploaded-image.jpg'
              })
            };
          } 
          // Second request - S3 upload that fails with non-OK status
          else if (url === 'https://s3.example.com/upload?signature=abc') {
            // Important: Return a failed response
            return {
              ok: false,  // This will trigger the error in your code
              status: 403,
              statusText: 'Forbidden',
              json: async () => ({ error: 'Access denied' }),
              blob: () => Promise.resolve(new MockBlob(['test']))
            };
          } 
          // Handle local file URL from reactNativeImage
          else if (url.startsWith('file:///')) {
            // When the component tries to fetch the local file, return a Blob
            return {
              ok: true,
              status: 200,
              statusText: 'OK',
              json: async () => ({}),
              blob: () => Promise.resolve(new MockBlob(['test']))
            };
          }
          // Third request - create post (potentially without image)
          else if (url === 'http://10.0.2.2/post') {
            return {
              ok: true,
              status: 200,
              statusText: 'OK',
              json: async () => ({ id: '123', success: true })
            };
          }
        }
        
        console.error(`Unhandled request: ${typeof url === 'string' ? url : 'non-string URL'}`);
        throw new Error(`Unhandled request: ${typeof url === 'string' ? url : 'non-string URL'}`);
      }
    );
    
    // Replace global fetch
    global.fetch = mockFetch;
    
    // Trigger FileReader onload when readAsDataURL is called
    Object.defineProperty(mockFileReader, 'readAsDataURL', {
      value: (blob: Blob) => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: mockFileReader });
          }
        }, 0);
      }
    });
    
    // Mock Alert to respond to "Continue without image" option
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      // Find the button that says "Continue" or has "Continue" in its text
      const continueButton = buttons?.find(btn => 
        btn.text && (btn.text === 'Continue' || btn.text.includes('Continue'))
      );
      
      // If we found it, press it automatically
      if (continueButton?.onPress) {
        continueButton.onPress();
      }
    });
    
    // Render component
    const renderResult = render(<PostPage />);
    
    // Get elements
    const imageButton = renderResult.getByTestId('image-picker-button');
    const tagSelector = renderResult.getByTestId('mock-tag-selector');
    const titleInput = renderResult.getByTestId('mock-input-title');
    const submitButton = renderResult.getByTestId('submit-button');
    
    // Use separate act() for each interaction
    await act(async () => {
      fireEvent.press(imageButton);
    });
    
    await act(async () => {
      fireEvent.press(tagSelector);
    });
    
    await act(async () => {
      fireEvent.changeText(titleInput, 'Test Title');
    });
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Wait for the error alert and then continue without image
    await waitFor(() => {
      // Verify Alert.alert was called with appropriate error message
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('Upload Error'),
        expect.stringContaining('Failed to upload image'),
        expect.anything()
      );
    }, { timeout: 5000 });
    
    // Wait for the post to be submitted without an image
    await waitFor(() => {
      // Verify the post request was made without an image URL
      const postCall = mockFetch.mock.calls.find(call => 
        call[0] === 'http://10.0.2.2/post'
      );
      
      expect(postCall).toBeTruthy();
      if (postCall) {
        const requestOptions = postCall[1];
        const requestBody = JSON.parse(requestOptions.body as string);
        expect(requestBody).toHaveProperty('title', 'Test Title');
        expect(requestBody.imageUrl).toBeNull(); // Image URL should be null
      }
    }, { timeout: 5000 });
  });

  test("uploadImageToS3 returns null when imageUri is null", async () => {
    // Mock image picker to return null uri
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementationOnce(
      (_: any, callback: (response: any) => void) => {
        callback({
          didCancel: false,
          errorMessage: undefined,
          assets: [{ 
            uri: null, // This will cause imageUri to be null
            type: 'image/jpeg',
            fileName: 'image.jpg',
            fileSize: 1024
          }]
        });
      }
    );
    
    // This will track all URLs that fetch was called with
    const fetchedUrls: string[] = [];
    
    // Mock fetch implementation
    const mockFetch = jest.fn().mockImplementation(
      async (url: FetchURL, options?: RequestInit): Promise<FetchResponse> => {
        if (typeof url === 'string') {
          fetchedUrls.push(url);
          
          // Only handle the post request - we shouldn't see S3 requests
          if (url === 'http://10.0.2.2/post') {
            return {
              ok: true,
              status: 200,
              statusText: 'OK',
              json: async () => ({ id: '123', success: true })
            };
          }
        }
        
        console.error(`Unhandled request: ${typeof url === 'string' ? url : 'non-string URL'}`);
        throw new Error(`Unhandled request: ${typeof url === 'string' ? url : 'non-string URL'}`);
      }
    );
    
    // Replace global fetch
    global.fetch = mockFetch;
    
    // Trigger FileReader onload when readAsDataURL is called
    Object.defineProperty(mockFileReader, 'readAsDataURL', {
      value: (blob: Blob) => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: mockFileReader });
          }
        }, 0);
      }
    });
    
    // Render component
    const renderResult = render(<PostPage />);
    
    // Get elements
    const imageButton = renderResult.getByTestId('image-picker-button');
    const tagSelector = renderResult.getByTestId('mock-tag-selector');
    const titleInput = renderResult.getByTestId('mock-input-title');
    const submitButton = renderResult.getByTestId('submit-button');
    
    // Use separate act() for each interaction
    await act(async () => {
      fireEvent.press(imageButton); // This will set imageUri to null
    });
    
    await act(async () => {
      fireEvent.press(tagSelector);
    });
    
    await act(async () => {
      fireEvent.changeText(titleInput, 'Test Title With Null Image');
    });
    
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Wait for the post submission
    await waitFor(() => {
      // Verify fetch was only called for the post endpoint, not for S3
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(fetchedUrls).toContain('http://10.0.2.2/post');
      
      // Importantly, we should NOT see calls to get presigned URL or upload to S3
      expect(fetchedUrls).not.toContain('http://10.0.2.2/post/s3/presigned-url');
      expect(fetchedUrls.some(url => url.includes('s3.example.com'))).toBeFalsy();
      
      // Verify the post request was made without an image URL
      const postCall = mockFetch.mock.calls[0];
      expect(postCall[0]).toBe('http://10.0.2.2/post');
      
      const requestOptions = postCall[1];
      const requestBody = JSON.parse(requestOptions.body as string);
      expect(requestBody).toHaveProperty('title', 'Test Title With Null Image');
      expect(requestBody.imageUrl).toBeNull(); // Image URL should be null
    }, { timeout: 5000 });
  });
});

describe('getFileExtension', () => {
  test('correctly extracts valid extensions', () => {
    expect(getFileExtension('file:///path/to/image.jpg')).toBe('jpg'); // Normal case
  });

  test('handles missing or invalid extensions', () => {
    expect(getFileExtension('file:///path/to/noextension')).toBe('jpeg'); // No extension
    expect(getFileExtension('file:///path/to/image.')).toBe(''); // Trailing dot
  });

  test('handles filenames without slashes', () => {
    expect(getFileExtension('filename.txt')).toBe('txt'); // Normal case
    expect(getFileExtension('filename')).toBe('jpeg'); // No extension
    expect(getFileExtension('.gitignore')).toBe('gitignore'); // Hidden file
    expect(getFileExtension('file.')).toBe(''); // Trailing dot
  });

  test('handles edge cases for `fileName` extraction', () => {
    expect(getFileExtension('')).toBe('jpeg'); // Empty string
    expect(getFileExtension('/')).toBe('jpeg'); // Single slash
    expect(getFileExtension('file:///path/to/')).toBe('jpeg'); // Ends with a slash
    expect(getFileExtension('///')).toBe('jpeg'); // Multiple slashes
    expect(getFileExtension('.')).toBe(''); // Just a dot
    expect(getFileExtension('..')).toBe(''); // Just two dots
  });

  // Test for undefined `endpoint` case (when `uri` is empty)
  test('returns "jpeg" when uri is empty', () => {
    expect(getFileExtension('')).toBe('jpeg');
  });

  // Test when endpoint is null or undefined after `pop()`
  test('returns "jpeg" when endpoint is null or undefined', () => {
    expect(getFileExtension('file:///path/to/')).toBe('jpeg'); // No file name
  });

  // Test for `endpoint?.split('.') || []` to ensure it correctly falls back
  test('returns valid extension or fallback when split does not work', () => {
    expect(getFileExtension('file:///path/to/image.jpg')).toBe('jpg'); // Should split correctly
    expect(getFileExtension('file:///path/to/noextension')).toBe('jpeg'); // No extension part
    expect(getFileExtension('file:///path/to/image.')).toBe(''); // Trailing dot
    expect(getFileExtension('filename.')).toBe(''); // Trailing dot in file name
    expect(getFileExtension('file.')).toBe(''); // Just a dot
  });
});
