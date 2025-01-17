import axios from 'axios';

export const Axios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_WPP_URL}/api`,
});
