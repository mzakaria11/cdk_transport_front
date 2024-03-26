import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { ConfigService } from './config.service';
import { Config } from './config.model';
import Swal from 'sweetalert2';

import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigComponent implements OnInit {

  // public
  public contentHeader: object;
  public config: Config;
  public configs: Config[];
  public disableCkbx: boolean;

  // private
  private _unsubscribeAll: Subject<any>;

  constructor(private _configService: ConfigService) {
    this._unsubscribeAll = new Subject();
  }

  onSubmit(configForm) {

    if (configForm.invalid) {
      return;
    }
    
    Swal.fire({
      title: 'Confirmez l\'enregistrement',
      text: "Êtes-vous sûr de vouloir enregistrer cette configuration ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, Enregistrer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(
      (res) => {
        if (res.isConfirmed) {
          console.log(configForm.value);
          this._configService.save(configForm.value).subscribe(
            res => {             
              Swal.fire({
                title: 'Configuration enregistrée !',
                text: 'Votre configuration a été enregistrée avec succès.',
                icon: 'success'
              }).then(
                () => this._configService.getDataTableRows()
              );
            },
            err => {
              Swal.fire({
                title: 'Opss !',
                text: 'Une erreur est survenue lors de l\'enregistrement de la configuration.',
                icon: 'error'
              });
            }
          )
        }
      }
    );
  }

  toggleCkbx(conf) {
    this._configService.activate(conf).subscribe(
      (res) => {
        this.disableCkbx = this._disableCkbx();    
        this._configService.getDataTableRows();

        Swal.fire({
          title: 'Configuration enregistrée !',
          text: 'Votre configuration a été enregistrée avec succès.',
          icon: 'success'
        });
      },
      () => {
        this.configs.find(e => e == conf).active = !conf.active; 
        Swal.fire({
          title: 'Opss !',
          text: 'Une erreur est survenue lors de l\'enregistrement de la configuration.',
          icon: 'error'
        });
      }
    )
  }

  _disableCkbx() {    
    return this.configs.find(e => e.active) ? true : false;
  }

  ngOnInit() {
    this._configService.onConfigChanged.pipe(takeUntil(this._unsubscribeAll))
    .subscribe(
      response => {
        this.configs = response as [];
        this.disableCkbx = this._disableCkbx();        
      }
    );

    // content header
    this.contentHeader = {
      headerTitle: 'App config',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Config',
            isLink: false
          }
        ]
      }
    };
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
