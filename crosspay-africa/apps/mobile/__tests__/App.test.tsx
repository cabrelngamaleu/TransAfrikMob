import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock des dépendances externes
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});