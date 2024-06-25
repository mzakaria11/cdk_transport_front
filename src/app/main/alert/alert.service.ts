import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  confirmDialog(options: SweetAlertOptions = {}): Promise<any> {
    const defaultOptions: SweetAlertOptions = {
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      showCancelButton: true
    };

    return Swal.fire({ ...defaultOptions, ...options });
  }

  successDialog(options: SweetAlertOptions = {}): Promise<any> {
    const defaultOptions: SweetAlertOptions = {
      position: 'top-end',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    };

    return Swal.fire({ ...defaultOptions, ...options });
  }

  errorDialog(options: SweetAlertOptions = {}): Promise<any> {
    const defaultOptions: SweetAlertOptions = {
      icon: 'error',
      title: 'Oops...',
    };
    
    return Swal.fire({ ...defaultOptions, ...options });
  }

  infoDialog(options: SweetAlertOptions = {}): Promise<any> {
    const defaultOptions: SweetAlertOptions = {
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    };

    return Swal.fire({ ...defaultOptions, ...options });
  }

}
