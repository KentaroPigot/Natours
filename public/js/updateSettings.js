import axios from 'axios';
import { showAlert } from './alert';

// Type is either "password" or "data"
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMe'
        : 'http://127.0.0.1:8000/api/v1/users/updateMyPassword';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if ((res.data.status = 'success')) {
      showAlert('success', `${type.toUpperCase()} updated successfully.`);
      setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
