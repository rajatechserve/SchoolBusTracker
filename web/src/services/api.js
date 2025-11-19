
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:4000/api', timeout: 10000 });
api.interceptors.request.use((config)=>{
  const t = localStorage.getItem('admin_token') || localStorage.getItem('user_token');
  if(t) config.headers = {...config.headers, Authorization: `Bearer ${t}`};
  return config;
});
export default api;
