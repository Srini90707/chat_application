import { API_CONFIG, USER_ENDPOINTS } from '@/config/api';
import { INITIAL_USERS } from '@/data/mockChatData';
import { apiClient } from '@/services/api/apiClient';
import { ApiError } from '@/services/api/apiError';
import { User, UserSearchResult } from '@/types/user';
import { normalizePhoneNumber } from '@/utils/phoneUtils';

/**
 * UserApi provides network and mock transport for user search and profile operations.
 */
class UserApi {
  /**
   * Search user by normalized mobile number
   * Endpoint: GET /api/users/search?mobile={mobile}
   */
  async searchUserByMobile(mobile: string): Promise<UserSearchResult | null> {
    const normalized = normalizePhoneNumber(mobile);

    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const match = INITIAL_USERS.find(
        (u) => u.mobileNumber && normalizePhoneNumber(u.mobileNumber) === normalized
      );

      if (!match) {
        throw new ApiError('No registered user found with this mobile number.', 404, 'NOT_FOUND');
      }

      return {
        id: match.id,
        name: match.name,
        mobileNumber: match.mobileNumber || normalized,
        avatar: match.avatar,
        about: match.about,
        isOnline: match.isOnline,
      };
    }

    try {
      const result = await apiClient.get<{ number: string; name?: string }>(
        USER_ENDPOINTS.SEARCH_BY_MOBILE,
        {
          params: { mobile: normalized },
        }
      );
      return {
        id: result.number,
        name: result.name || result.number,
        mobileNumber: result.number,
        isOnline: false,
      };
    } catch (err: unknown) {
      if (ApiError.isApiError(err) && err.statusCode === 404) {
        throw new ApiError('No registered user found with this mobile number.', 404, 'NOT_FOUND');
      }
      throw err;
    }
  }

  /**
   * Fetch user details by ID / number
   * Endpoint: GET /user/retrive/{number}
   */
  async fetchUserById(userId: string): Promise<User | null> {
    if (API_CONFIG.MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const match = INITIAL_USERS.find((u) => u.id === userId);
      return match ? { ...match } : null;
    }

    try {
      const result = await apiClient.get<{ number: string; name?: string }>(
        `${USER_ENDPOINTS.GET_USER_BY_NUMBER}/${encodeURIComponent(userId)}`
      );
      return {
        id: result.number,
        name: result.name || result.number,
        mobileNumber: result.number,
        isOnline: false,
        unreadCount: 0,
      };
    } catch {
      return null;
    }
  }
}

export const userApi = new UserApi();
