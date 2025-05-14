export interface User {
    id: number;
    uname: string;
    email: string;
    role: number;
    activated: number;
    banned: boolean;
    createdAt?: string;
    updatedAt?: string;
    activatedAt?: string;
    bannedAt?: string;
    adminType?: number;
    staffType?: number;
    phone?: string;
    address?: string;
    hiredDate?: string;
    firstName?: string;
    lastName?: string;
    shelter?: {
        shelterId: number;
        shelterName: string;
        shelterLocation: string;
        shelterPhone: string;
    };
}

export enum UserRole {
    Admin = 0,
    Adopter = 1,
    ShelterStaff = 2
}

export enum StaffType {
    Manager = 0,
    Interviewer = 1,
    CareTaker = 2
}

export enum AdminType {
    SuperAdmin = 0,
    UsersAdmin = 1,
    ShelterAdmin = 2
}

export interface DashboardStatsDto {
    totalShelters: number;
    totalPets: number;
    activeUsers: number;
    recentRequests: AdoptionRequestDto[];
    approvedAdoptions: number;
    totalAdoptions: number;
    totalUsers: number;
}

export interface AdoptionRequestDto {
    requestId: number;
    adopter: {
        id: number;
        uname: string;
    };
    animal: {
        id: number;
        name: string;
    };
    approvedAt: string | null;
}

export interface MessageModel {
    id: number;
    senderEmail: string;
    receiverEmail: string;
    message: string;
    timestamp: string;
} 