// src/api/memberApi.ts
import { publicApi, authApi as tokenApi } from './axios';
import type { AuthResponse, SignupRequest, SignupResult, Member } from '../types/auth';

export const memberApi = {
    // 1. 회원가입 (토큰 X -> publicApi)
    signup: async (data: SignupRequest) => {
        const response = await publicApi.post<AuthResponse<SignupResult>>('/api/v1/members/signup', data);
        return response.data;
    },

    // 2. 내 정보 조회 (토큰 O -> tokenApi)
    getMe: async () => {
        const response = await tokenApi.get<AuthResponse<Member>>('/api/v1/members/me');
        return response.data;
    },

    // 3. 닉네임 변경 (토큰 O -> tokenApi)
    updateNickname: async (newNickname: string) => {
        const response = await tokenApi.patch<AuthResponse<{ nickname: string }>>('/api/v1/members/me/nickname', {
            nickname: newNickname
        });
        return response.data;
    },

    // 4. 캐릭터 이름(별명) 변경 (토큰 O -> tokenApi)
    updateBuddyName: async (newBuddyName: string) => {
        const response = await tokenApi.patch<AuthResponse<string>>('/api/v1/members/me/character-name', {
            characterName: newBuddyName
        });
        return response.data;
    },

    // 5. 캐릭터 종류 변경 (토큰 O -> tokenApi)
    updateCharacterType: async (characterSeq: number) => {
        const response = await tokenApi.patch<AuthResponse<Member>>('/api/v1/members/me/character', {
            characterSeq: characterSeq
        });
        return response.data;
    },

    // 6. 비밀번호 수정 (토큰 O -> tokenApi)
    updatePassword: async (password: string) => {
        const response = await tokenApi.patch<AuthResponse<string>>('/api/v1/members/me/password', {
            password
        });
        return response.data;
    },

    // 7. 회원 탈퇴 (토큰 O -> tokenApi)
    deleteAccount: async () => {
        const response = await tokenApi.delete<AuthResponse<string>>('/api/v1/members/delete-account');
        return response.data;
    }
};