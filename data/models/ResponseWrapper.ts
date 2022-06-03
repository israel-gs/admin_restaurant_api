export type ResponseWrapper<T> = {
  code: number
  status: boolean
  data: T
  errors?: string[]
}