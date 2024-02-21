//body auth register controller 
export interface RegisterBody {
  name: string;
  username: string;
  email: string;
  password: string;
}

//body auth login controller
export interface LoginBody {
  identifier: string;
  password: string;
}

export interface SendMailOptions {
  from: string
  to: string
  subject: string
  html: string
}