export interface UserModel {
  name: string
  username: string
  password: string
  isAdmin: boolean
  isBlocked: boolean
  attemptsCount: number
}