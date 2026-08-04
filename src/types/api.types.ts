/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SendOtpDto {
  /** @example "test@example.com" */
  email: string;
  /**
   * Context of the OTP, e.g. REGISTER, WITHDRAW, DEPOSIT
   * @example "REGISTER"
   */
  context: string;
}

export interface MessageResponseDto {
  /** @example true */
  success: boolean;
  /** @example "Operation completed successfully" */
  message: string;
}

export interface VerifyOtpDto {
  /** @example "test@example.com" */
  email: string;
  /** @example "123456" */
  code: string;
  /** @example "REGISTER" */
  context: string;
}

export interface ChallengeResponseDto {
  /**
   * A short-lived JWT token to prove OTP verification
   * @example "eyJh..."
   */
  challengeToken: string;
}

export interface RegisterDto {
  /** @example "John" */
  firstName: string;
  /** @example "Doe" */
  lastName: string;
  /** @example "johndoe" */
  username: string;
  /** @example "test@example.com" */
  email: string;
  /** @example "password123" */
  password: string;
}

export interface UserDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "test@example.com" */
  email: string;
  /** @example "0x123abc..." */
  walletAddress: string;
}

export interface AuthResponseDto {
  /** @example "eyJh..." */
  access_token: string;
  /** @example "eyJh..." */
  refresh_token: string;
  user: UserDto;
}

export interface LoginDto {
  /** @example "test@example.com or johndoe" */
  identifier: string;
  /** @example "password123" */
  password: string;
}

export interface RefreshTokenDto {
  /** @example "eyJh..." */
  refreshToken: string;
}

export interface ChangePasswordDto {
  /** @example "old_password123" */
  oldPassword: string;
  /** @example "new_password123" */
  newPassword: string;
}

export interface UserProfileDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "test@example.com" */
  email: string;
  /** @example "0x123abc..." */
  walletAddress: string;
}

export interface UpdateProfileDto {
  /** @example "password123" */
  password?: string;
  /** @example "https://example.com/cv.pdf" */
  cvUrl?: string;
  /** @example ["React","NestJS"] */
  skills?: string[];
  /** @example "Software Engineer" */
  bio?: string;
  /** @example "Male" */
  gender?: string;
  /** @example 1995 */
  birthYear?: number;
  /** @example "phone: 123456789" */
  contactInfo?: string;
  /** @example {"linkedin":"https://..."} */
  socialLinks?: object;
}

export interface PublicProfileDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "0x123abc..." */
  walletAddress: string;
}

export interface UpdateBankAccountDto {
  /** @example "123456789" */
  accountNumber: string;
  /** @example "Techcombank" */
  bankName: string;
}

export interface BankAccountResponseDto {
  /** @example "**** 6789" */
  maskedData: string;
}

export interface BalanceResponseDto {
  /** @example 1050.5 */
  balance: number;
}

export interface DepositWithdrawDto {
  /** @example 500 */
  amount: number;
  /** @example "USD" */
  currency: string;
  /** @example "nonce-uuid-1234" */
  nonce: string;
  /** @example "bank-account-uuid" */
  bankAccountId?: string;
}

export interface TransactionResponseDto {
  /** @example "uuid-tx-1234" */
  id: string;
  /** @example "uuid-user-1234" */
  userId: string;
  /** @example "DEPOSIT" */
  type: string;
  /** @example 500 */
  amount: number;
  /** @example "USD" */
  currency: string;
  /** @example "PENDING" */
  status: string;
  /** @example "0xhash..." */
  txHash: string;
}

export interface PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface PaginatedTransactionResponseDto {
  data: TransactionResponseDto[];
  meta: PaginationMetaDto;
}

export interface CreateProjectDto {
  /** @example "DeFi Dashboard" */
  title: string;
  /** @example "A dashboard to track DeFi metrics." */
  description: string;
  /** @example 1000 */
  budget: number;
  /** @example "PUBLIC" */
  type: "PUBLIC" | "PRIVATE";
}

export interface ProjectResponseDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "uuid-pm-1234" */
  pmId: string;
  /** @example "DeFi Dashboard" */
  title: string;
  /** @example "A dashboard to track DeFi metrics." */
  description: string;
  /** @example 1000 */
  budget: number;
  /** @example "PUBLIC" */
  type: string;
  /** @example "2026-07-30T10:00:00Z" */
  createdAt: string;
  /** @example "2026-07-30T10:00:00Z" */
  updatedAt: string;
}

export interface PaginatedProjectResponseDto {
  data: ProjectResponseDto[];
  meta: PaginationMetaDto;
}

export interface AssignRoleDto {
  /** @example "uuid-user-1234" */
  userId: string;
  /** @example "LEAD_DEV" */
  role: "PM" | "LEAD_DEV" | "REVIEWER" | "DEV";
}

export interface ProjectMemberResponseDto {
  /** @example "uuid-member-1234" */
  id: string;
  /** @example "uuid-project-1234" */
  projectId: string;
  /** @example "uuid-user-1234" */
  userId: string;
  /** @example "LEAD_DEV" */
  role: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  base64?: string;
  url?: string;
  size?: number;
  type?: string;
}

export interface CreateTaskDto {
  /** @example "Implement login" */
  title: string;
  /** @example "Implement the login flow using NestJS." */
  description: string;
  /** @example 500 */
  budget?: number;
  /** @example "OPEN" */
  status?: string;
  /** @example "Moderate" */
  priority?: string;
  /** @example ["Frontend", "Bug"] */
  tags?: string[] | string;
  /** @example [{ id: "1", name: "spec.png", base64: "data:image/png;base64,..." }] */
  attachments?: TaskAttachment[] | string;
  /** @example "2026-12-31T23:59:59Z" */
  deadline?: string;
  /** @example "parent-task-uuid" */
  parentId?: string;
  /** @example "uuid-of-assignee" */
  assigneeId?: string;
}

export interface TaskResponseDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "uuid-project-1234" */
  projectId: string;
  /** @example "Implement login" */
  title: string;
  /** @example "Implement the login flow using NestJS." */
  description: string;
  /** @example "OPEN" */
  status: string;
  /** @example 500 */
  budget: number;
  priority?: string;
  tags?: string;
  attachments?: string;
  deadline?: string;
  assigneeId?: string;
  assignee?: any;
  project?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTaskResponseDto {
  data: TaskResponseDto[];
  meta: PaginationMetaDto;
}

export interface UpdateTaskDto {
  /** @example "Updated title" */
  title?: string;
  /** @example "IN_PROGRESS" */
  status?: "OPEN" | "IN_PROGRESS" | "REVIEW" | "DONE" | string;
  /** @example "uuid-of-assignee" */
  assigneeId?: string;
  /** @example "Updated description" */
  description?: string;
  /** @example 500 */
  budget?: number;
  priority?: string;
  tags?: string[] | string;
  attachments?: TaskAttachment[] | string;
  deadline?: string;
}

export interface CreateCommentDto {
  /** @example "Looking good!" */
  content: string;
}

export interface CommentResponseDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "Looking good!" */
  content: string;
  /** @example "uuid-user-1234" */
  userId: string;
}

export interface LockFundDto {
  /** @example "task-uuid-123" */
  taskId: string;
}

export interface Web3ResponseDto {
  /** @example true */
  success: boolean;
  /** @example "0xlock_123456789" */
  txHash: string;
  /** @example "Funds locked in Escrow" */
  message: string;
}

export interface ApprovePayoutDto {
  /** @example "task-uuid-123" */
  taskId: string;
}

export interface SyncTransactionDto {
  /** @example "0x123abc456def789..." */
  txHash: string;
  /** @example "COMPLETED" */
  status: "COMPLETED" | "FAILED";
}

export interface SyncResponseDto {
  /** @example true */
  success: boolean;
  /** @example "Transaction status updated to COMPLETED" */
  message: string;
}

export interface NotificationResponseDto {
  /** @example "uuid-1234" */
  id: string;
  /** @example "uuid-user-1234" */
  userId: string;
  /** @example "Your task has been approved." */
  message: string;
  /** @example true */
  isRead: boolean;
  /** @example "2026-07-30T10:00:00Z" */
  createdAt: string;
}

export interface PaginatedNotificationResponseDto {
  data: NotificationResponseDto[];
  meta: PaginationMetaDto;
}

export interface WebhookResponseDto {
  /** @example true */
  success: boolean;
}
