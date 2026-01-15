// import axiosInstance from './axios'; // (삭제) 이거 대신 아래꺼 쓰세요
import { authApi } from './axios';      // (변경) 토큰이 필요한 요청용 인스턴스
import type { AuthResponse, Member } from '../types/auth';

export const userApi = {
    // 1. 닉네임 변경 (로그인 필요 -> authApi)
    updateNickname: async (newNickname: string) => {
        const response = await authApi.patch<AuthResponse<{ nickname: string }>>('/api/v1/members/me/nickname', {
            nickname: newNickname
        });
        return response.data;
    },

    // 2. 캐릭터 이름 변경 (로그인 필요 -> authApi)
    updateBuddyName: async (newBuddyName: string) => {
        const response = await authApi.patch<AuthResponse<string>>('/api/v1/users/me/character-name', {
            characterName: newBuddyName
        });
        return response.data;
    },

    // 3. 캐릭터 종류 변경 (로그인 필요 -> authApi)
    updateCharacterType: async (characterSeq: number) => {
        const response = await authApi.patch<AuthResponse<Member>>('/api/v1/users/me/character', {
            characterSeq: characterSeq
        });
        return response.data;
    },

    // 4. 내 정보 조회 (로그인 필요 -> authApi)
    getMe: async () => {
        const response = await authApi.get<AuthResponse<Member>>('/api/v1/members/me');
        return response.data;
    }
};