import { DefaultSession } from "next-auth";
import { User as CustomUser } from "./index";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userData?: CustomUser;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    userData?: CustomUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userData?: CustomUser;
  }
}
