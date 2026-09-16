type ApiError = {
  code: number;
  message: string;
};

export type ApiResult<T = any> = { message?: string } & (
  | {
      success: false;
      error: ApiError;
    }
  | {
      success: true;
      data?: T;
    }
);
