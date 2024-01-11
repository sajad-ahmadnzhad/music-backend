//body auth register controller 
export interface RegisterBody {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

//body auth login controller
export interface LoginBody {
  identifier: string;
  password: string;
}