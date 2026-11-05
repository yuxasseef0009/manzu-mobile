import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';
const swallow = () => undefined;

// Fire-and-forget wrappers; haptics must never break a user action.
export const haptics = {
  selection: () => {
    if (enabled) Haptics.selectionAsync().catch(swallow);
  },
  success: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(swallow);
  },
  warning: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(swallow);
  },
  error: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(swallow);
  },
};
