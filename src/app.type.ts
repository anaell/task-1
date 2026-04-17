export interface GenderizeAPIResponseType {
  count: number;
  probability: number;
  name: string;
  gender: string;
}

export interface AgifyAPIResponseType {
  count: number;
  name: string;
  age: number;
  country_id?: string;
}

export interface NationalizeAPIResponseType {
  count: number;
  name: string;
  country: {
    country_id: string;
    probability: number;
  }[];
}

export interface ProcessPostRequestFunctionType {
  status: string;
  data: {
    id: string;
    name: string;
    gender: string;
    gender_probability: number;
    sample_size: number;
    age: number;
    age_group: string;
    country_id: string;
    country_probability: number;
    created_at: string;
  };
}

export interface userType {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
}

export type createUserType = Omit<userType, 'created_at'>;

export interface fetchUsersWithOptionalFiltersType {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: string;
  country_id: string;
}
