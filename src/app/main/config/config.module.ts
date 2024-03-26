import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CoreCommonModule } from '@core/common.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { AuthGuard } from 'app/auth/helpers';

import { ConfigComponent } from './config.component';
import { ConfigService } from './config.service';

const routes: Routes = [
  {
    path: '',
    component: ConfigComponent,
    canActivate: [AuthGuard],
    resolve: {
      accountSetting: ConfigService
    },
    data: { animation: 'account-settings' }
  }
];

@NgModule({
  declarations: [
    ConfigComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    CoreCommonModule,
    ContentHeaderModule,
    Ng2FlatpickrModule
  ],
})
export class ConfigModule { }
