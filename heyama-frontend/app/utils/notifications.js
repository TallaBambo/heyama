import { toast } from "react-toastify";

export const showErrorMessage = (message) => {
  toast.error(message);
};

export const showSuccessMessage = (message) => {
  toast.success(message);
};
