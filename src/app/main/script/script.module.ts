import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptDashboardComponent } from './script-dashboard/script-dashboard.component';
import { ScriptDashboardService } from './script-dashboard/script-dashboard.service';
import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { FileUploadModule } from 'ng2-file-upload';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { RouterModule, Routes } from '@angular/router';
import { ScriptHistoryComponent } from './script-history/script-history.component';
import { ScriptHistoryService } from './script-history/script-history.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Role } from 'app/auth/models';
import { CsvModule } from '@ctrl/ngx-csv';

const routes: Routes = [
  {
    path: 'script',
    component: ScriptDashboardComponent,
    resolve: {
      sds: ScriptDashboardService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'ScriptDashboardComponent' }
  },
  {
    path: 'history/:ts',
    component: ScriptHistoryComponent,
    resolve: {
      shs: ScriptHistoryService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'history/:ts' }
  }
];

@NgModule({
  declarations: [
    ScriptDashboardComponent,
    ScriptHistoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule,
    ContentHeaderModule,
    FileUploadModule,
    NgApexchartsModule,
    CsvModule
  ]
})
export class ScriptModule { }
