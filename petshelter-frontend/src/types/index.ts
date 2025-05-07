export interface UserDto {
    id: number;
    uname: string;
    email: string;
    role: number;
    name: string;
    phone?: string;
    address?: string;
    staffType?: number;
    adminType?: number;
    activated?: number;
}

export enum UserRole {
    Adopter = 1,
    ShelterStaff = 2,
    Admin = 3
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