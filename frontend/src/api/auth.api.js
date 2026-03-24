import client from './axiosClient';

export const login = (email, password) =>
  client.post('/SignIn', { email, password }).then(r => {
    localStorage.setItem('token', r.data.token);
    return r.data;
  });

export const logout = () => {
  localStorage.removeItem('token');
  return client.post('/logout');
};

export const signUp = (formData) =>
  client.post('/SignUp', formData).then(r => {
    localStorage.setItem('token', r.data.token);
    alert("resultat du signup (api): " + JSON.stringify(r.data));
    return r.data;
});