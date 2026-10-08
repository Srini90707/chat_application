import { ApiError } from '@/services/api/apiError';
import { User, UserSearchResult } from '@/types/user';
import { normalizePhoneNumber, validatePhoneNumber } from '@/utils/phoneUtils';
import { userApi } from './userApi';

class UserService {
  /**
   * Search for a user by mobile number with client validation and self-search prevention
   */
  async searchUser(
    rawMobile: string,
    currentUserMobile?: string,
    currentUserId?: string
  ): Promise<UserSearchResult> {
    const trimmed = rawMobile.trim();

    if (!trimmed) {
      throw new ApiError('Please enter a mobile number to search.', 400, 'EMPTY_INPUT');
    }

    if (!validatePhoneNumber(trimmed)) {
      throw new ApiError(
        'Please enter a valid 10-digit Indian mobile number.',
        400,
        'INVALID_MOBILE'
      );
    }

    const normalized = normalizePhoneNumber(trimmed);

    // Prevent searching for current user
    if (currentUserMobile && normalizePhoneNumber(currentUserMobile) === normalized) {
      throw new ApiError('You cannot search for or chat with your own mobile number.', 400, 'SELF_SEARCH');
    }

    const result = await userApi.searchUserByMobile(normalized);

    if (!result) {
      throw new ApiError('No registered user found with this mobile number.', 404, 'NOT_FOUND');
    }

    if (currentUserId && result.id === currentUserId) {
      throw new ApiError('You cannot start a conversation with yourself.', 400, 'SELF_SEARCH');
    }

    return result;
  }

  /**
   * Get user profile by user id
   */
  async getUserById(userId: string): Promise<User | null> {
    return userApi.fetchUserById(userId);
  }
}

export const userService = new UserService();
